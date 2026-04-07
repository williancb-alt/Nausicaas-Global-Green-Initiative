from unittest.mock import patch, MagicMock

from nausicass_global_green_initiative_api.services.monitoring.sentry_monitoring import (
    SentryMonitoringService,
)


class TestSentryMonitoringServiceInit:
    @patch("sentry_sdk.init")
    def test_calls_sentry_init_with_config(self, mock_init):
        service = SentryMonitoringService()
        service.init(
            dsn="https://key@sentry.io/123",
            environment="staging",
            traces_sample_rate=0.5,
            debug=True,
        )
        mock_init.assert_called_once()
        call_kwargs = mock_init.call_args[1]
        assert call_kwargs["dsn"] == "https://key@sentry.io/123"
        assert call_kwargs["environment"] == "staging"
        assert call_kwargs["traces_sample_rate"] == 0.5
        assert call_kwargs["debug"] is True

    @patch("sentry_sdk.init")
    def test_applies_defaults(self, mock_init):
        service = SentryMonitoringService()
        service.init(dsn="https://key@sentry.io/123")
        call_kwargs = mock_init.call_args[1]
        assert call_kwargs["environment"] == "production"
        assert call_kwargs["traces_sample_rate"] == 1.0
        assert call_kwargs["profiles_sample_rate"] == 0.1
        assert call_kwargs["debug"] is False
        assert call_kwargs["send_default_pii"] is True


class TestSentryMonitoringServiceMethods:
    def setup_method(self):
        self.service = SentryMonitoringService()

    @patch("sentry_sdk.capture_exception")
    @patch("sentry_sdk.push_scope")
    def test_capture_exception_without_context(self, mock_scope, mock_capture):
        error = RuntimeError("test")
        self.service.capture_exception(error)
        mock_capture.assert_called_once_with(error)

    @patch("sentry_sdk.capture_exception")
    @patch("sentry_sdk.push_scope")
    def test_capture_exception_with_context(self, mock_scope, mock_capture):
        error = RuntimeError("test")
        scope = MagicMock()
        mock_scope.return_value.__enter__ = MagicMock(return_value=scope)
        mock_scope.return_value.__exit__ = MagicMock(return_value=False)

        self.service.capture_exception(error, {"key": "value"})

        scope.set_extra.assert_called_once_with("key", "value")
        mock_capture.assert_called_once_with(error)

    @patch("sentry_sdk.capture_message")
    def test_capture_message(self, mock_capture):
        self.service.capture_message("hello", level="warning")
        mock_capture.assert_called_once_with("hello", level="warning")

    @patch("sentry_sdk.set_user")
    def test_set_user(self, mock_set_user):
        user = {"id": "123", "email": "a@b.com"}
        self.service.set_user(user)
        mock_set_user.assert_called_once_with(user)

    @patch("sentry_sdk.set_user")
    def test_set_user_null(self, mock_set_user):
        self.service.set_user(None)
        mock_set_user.assert_called_once_with(None)

    @patch("sentry_sdk.add_breadcrumb")
    def test_add_breadcrumb(self, mock_add):
        self.service.add_breadcrumb(
            category="http", message="request", level="info", data={"url": "/api"}
        )
        mock_add.assert_called_once_with(
            category="http", message="request", level="info", data={"url": "/api"}
        )

    @patch("sentry_sdk.set_tag")
    def test_set_tag(self, mock_set_tag):
        self.service.set_tag("user.role", "admin")
        mock_set_tag.assert_called_once_with("user.role", "admin")

    @patch("sentry_sdk.set_context")
    def test_set_context(self, mock_set_context):
        ctx = {"page": "dashboard"}
        self.service.set_context("app", ctx)
        mock_set_context.assert_called_once_with("app", ctx)


class TestSentryTransaction:
    @patch("sentry_sdk.start_span")
    def test_start_transaction_creates_span(self, mock_start):
        service = SentryMonitoringService()
        service.start_transaction(name="test-op", op="http")
        mock_start.assert_called_once_with(name="test-op", op="http")

    @patch("sentry_sdk.start_span")
    def test_finish_exits_span(self, mock_start):
        mock_span = MagicMock()
        mock_start.return_value = mock_span

        service = SentryMonitoringService()
        tx = service.start_transaction(name="test", op="test")
        tx.finish()

        mock_span.__exit__.assert_called_once_with(None, None, None)

    @patch("sentry_sdk.start_span")
    def test_set_status_delegates_to_span(self, mock_start):
        mock_span = MagicMock()
        mock_start.return_value = mock_span

        service = SentryMonitoringService()
        tx = service.start_transaction(name="test", op="test")
        tx.set_status("ok")

        mock_span.set_status.assert_called_once_with("ok")
