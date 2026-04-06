import json
import logging
from unittest.mock import patch

import pytest
from flask import Flask

from nausicass_global_green_initiative_api.middleware.request_id import (
    register_request_id,
)
from nausicass_global_green_initiative_api.middleware.request_logging import (
    register_request_logging,
)
from nausicass_global_green_initiative_api.services.logging.json_logs_format import (
    JSONLogsFormat,
)
from nausicass_global_green_initiative_api.services.logging.logging_service import (
    configure_logging,
)


@pytest.fixture
def minimal_app():
    """Minimal Flask app without full blueprint registration."""
    app = Flask("test")

    @app.route("/health")
    def health():
        return "ok"

    @app.route("/ready")
    def ready():
        return "ready"

    return app


@pytest.fixture
def prod_app(minimal_app):
    configure_logging(minimal_app, "production")
    register_request_id(minimal_app)
    register_request_logging(minimal_app)
    return minimal_app


@pytest.fixture
def dev_app(minimal_app):
    configure_logging(minimal_app, "development")
    register_request_id(minimal_app)
    register_request_logging(minimal_app)
    return minimal_app


@pytest.fixture
def test_app(minimal_app):
    configure_logging(minimal_app, "testing")
    register_request_id(minimal_app)
    register_request_logging(minimal_app)
    return minimal_app


class TestConfigureLogging:
    def test_production_sets_info_level(self, prod_app):
        assert prod_app.logger.level == logging.INFO

    def test_development_sets_debug_level(self, dev_app):
        assert dev_app.logger.level == logging.DEBUG

    def test_testing_sets_warning_level(self, test_app):
        assert test_app.logger.level == logging.WARNING

    def test_production_uses_json_formatter(self, prod_app):
        handler = prod_app.logger.handlers[0]
        assert isinstance(handler.formatter, JSONLogsFormat)

    def test_development_uses_readable_formatter(self, dev_app):
        handler = dev_app.logger.handlers[0]
        assert not isinstance(handler.formatter, JSONLogsFormat)

    def test_werkzeug_logger_is_warning_level(self, prod_app):
        assert logging.getLogger("werkzeug").level == logging.WARNING

    def test_sqlalchemy_logger_info_level_in_dev(self, dev_app):
        assert logging.getLogger("sqlalchemy.engine").level == logging.INFO

    def test_sqlalchemy_logger_warning_level_in_prod(self, prod_app):
        assert logging.getLogger("sqlalchemy.engine").level == logging.WARNING


class TestJSONLogsFormat:
    @pytest.fixture
    def formatter(self):
        return JSONLogsFormat()

    def test_output_is_valid_json(self, formatter):
        record = logging.LogRecord("test", logging.INFO, "", 0, "hello", (), None)
        output = formatter.format(record)
        parsed = json.loads(output)
        assert parsed["message"] == "hello"
        assert parsed["level"] == "INFO"

    def test_includes_standard_fields(self, formatter):
        record = logging.LogRecord(
            "mylogger", logging.WARNING, "mymodule.py", 42, "test msg", (), None
        )
        parsed = json.loads(formatter.format(record))
        assert parsed["logger"] == "mylogger"
        assert parsed["level"] == "WARNING"
        assert parsed["line"] == 42
        assert "timestamp" in parsed

    def test_includes_extra_fields(self, formatter):
        record = logging.LogRecord("test", logging.INFO, "", 0, "msg", (), None)
        record.user_id = "abc-123"
        record.method = "POST"
        parsed = json.loads(formatter.format(record))
        assert parsed["user_id"] == "abc-123"
        assert parsed["method"] == "POST"

    def test_includes_exception_info(self, formatter):
        import sys

        try:
            raise ValueError("boom")
        except ValueError:
            exc_info = sys.exc_info()
            record = logging.LogRecord(
                "test", logging.ERROR, "", 0, "failed", (), exc_info=exc_info
            )
        parsed = json.loads(formatter.format(record))
        assert "exception" in parsed
        assert "ValueError: boom" in parsed["exception"]

    def test_request_id_from_extra(self, formatter):
        record = logging.LogRecord("test", logging.INFO, "", 0, "msg", (), None)
        record.request_id = "req-456"
        parsed = json.loads(formatter.format(record))
        assert parsed["request_id"] == "req-456"

    def test_request_id_from_flask_g(self, formatter, prod_app):
        with prod_app.test_request_context():
            from flask import g

            g.request_id = "flask-req-789"
            record = logging.LogRecord("test", logging.INFO, "", 0, "msg", (), None)
            parsed = json.loads(formatter.format(record))
            assert parsed["request_id"] == "flask-req-789"

    def test_no_request_id_outside_request_context(self, formatter):
        record = logging.LogRecord("test", logging.INFO, "", 0, "msg", (), None)
        parsed = json.loads(formatter.format(record))
        assert "request_id" not in parsed

    def test_non_serialisable_values_use_default_str(self, formatter):
        record = logging.LogRecord("test", logging.INFO, "", 0, "msg", (), None)
        record.custom_obj = object()
        output = formatter.format(record)
        parsed = json.loads(output)
        assert "custom_obj" in parsed


class TestRequestIdMiddleware:
    def test_generates_uuid_when_no_header(self, prod_app):
        client = prod_app.test_client()
        resp = client.get("/health")
        request_id = resp.headers.get("X-Request-ID")
        assert request_id is not None
        assert len(request_id) == 36

    def test_uses_incoming_header(self, prod_app):
        client = prod_app.test_client()
        resp = client.get("/health", headers={"X-Request-ID": "my-custom-id"})
        assert resp.headers.get("X-Request-ID") == "my-custom-id"

    def test_each_request_gets_unique_id(self, prod_app):
        client = prod_app.test_client()
        resp1 = client.get("/health")
        resp2 = client.get("/health")
        assert resp1.headers["X-Request-ID"] != resp2.headers["X-Request-ID"]

    def test_rejects_malformed_header(self, prod_app):
        client = prod_app.test_client()
        resp = client.get(
            "/health", headers={"X-Request-ID": "<script>alert(1)</script>"}
        )
        request_id = resp.headers.get("X-Request-ID")
        assert request_id != "<script>alert(1)</script>"
        assert len(request_id) == 36

    def test_rejects_oversized_header(self, prod_app):
        client = prod_app.test_client()
        resp = client.get("/health", headers={"X-Request-ID": "a" * 200})
        request_id = resp.headers.get("X-Request-ID")
        assert len(request_id) == 36


class TestRequestLoggingMiddleware:
    def test_health_endpoint_not_logged(self, prod_app):
        client = prod_app.test_client()
        with patch.object(prod_app.logger, "info") as mock_log:
            client.get("/health")
            for call in mock_log.call_args_list:
                if call.kwargs and call.kwargs.get("extra", {}).get("path"):
                    assert call.kwargs["extra"]["path"] != "/health"

    def test_non_health_request_is_logged(self, prod_app):
        client = prod_app.test_client()
        with patch.object(prod_app.logger, "info") as mock_log:
            client.get("/ready")
            logged_paths = [
                call.kwargs.get("extra", {}).get("path")
                for call in mock_log.call_args_list
                if call.kwargs
            ]
            assert "/ready" in logged_paths

    def test_log_includes_request_details(self, prod_app):
        client = prod_app.test_client()
        with patch.object(prod_app.logger, "info") as mock_log:
            client.get("/ready")
            matching = [
                call
                for call in mock_log.call_args_list
                if call.kwargs and call.kwargs.get("extra", {}).get("path") == "/ready"
            ]
            assert len(matching) == 1
            extra = matching[0].kwargs["extra"]
            assert extra["method"] == "GET"
            assert "status" in extra
            assert "duration_ms" in extra
            assert "ip" in extra
            assert "request_id" in extra
