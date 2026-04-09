from nausicass_global_green_initiative_api.services.monitoring.noop_monitoring import (
    NoopMonitoringService,
)


class TestNoopMonitoringService:
    def setup_method(self):
        self.service = NoopMonitoringService()

    def test_init_does_not_raise(self):
        self.service.init(dsn="test", environment="test")

    def test_capture_exception_does_not_raise(self):
        self.service.capture_exception(RuntimeError("test"))

    def test_capture_exception_with_context_does_not_raise(self):
        self.service.capture_exception(RuntimeError("test"), {"key": "value"})

    def test_capture_message_does_not_raise(self):
        self.service.capture_message("test message", level="error")

    def test_set_user_does_not_raise(self):
        self.service.set_user({"id": "123", "email": "a@b.com"})

    def test_set_user_null_does_not_raise(self):
        self.service.set_user(None)

    def test_add_breadcrumb_does_not_raise(self):
        self.service.add_breadcrumb(
            category="http", message="request", level="info", data={"url": "/api"}
        )

    def test_start_transaction_returns_noop_transaction(self):
        tx = self.service.start_transaction(name="test", op="test.op")
        assert tx is not None
        tx.finish()
        tx.set_status("ok")

    def test_set_tag_does_not_raise(self):
        self.service.set_tag("key", "value")

    def test_set_context_does_not_raise(self):
        self.service.set_context("ctx", {"a": 1})
