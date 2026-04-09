from unittest.mock import patch

from nausicass_global_green_initiative_api.services.monitoring import monitoring_service
from nausicass_global_green_initiative_api.services.monitoring.noop_monitoring import (
    NoopMonitoringService,
)
from nausicass_global_green_initiative_api.services.monitoring.sentry_monitoring import (
    SentryMonitoringService,
)


class TestGetMonitoring:
    def setup_method(self):
        monitoring_service._instance = NoopMonitoringService()

    def test_returns_noop_by_default(self):
        result = monitoring_service.get_monitoring()
        assert isinstance(result, NoopMonitoringService)


class TestInitMonitoring:
    def setup_method(self):
        monitoring_service._instance = NoopMonitoringService()

    @patch.object(SentryMonitoringService, "init")
    def test_initialises_sentry_service(self, mock_init):
        result = monitoring_service.init_monitoring(
            dsn="https://key@sentry.io/123", environment="test"
        )
        assert isinstance(result, SentryMonitoringService)
        mock_init.assert_called_once_with(
            dsn="https://key@sentry.io/123", environment="test"
        )

    @patch.object(SentryMonitoringService, "init")
    def test_get_monitoring_returns_sentry_after_init(self, mock_init):
        monitoring_service.init_monitoring(dsn="https://key@sentry.io/123")
        result = monitoring_service.get_monitoring()
        assert isinstance(result, SentryMonitoringService)

    @patch.object(SentryMonitoringService, "init", side_effect=Exception("bad dsn"))
    def test_falls_back_to_noop_on_init_failure(self, mock_init):
        result = monitoring_service.init_monitoring(dsn="bad")
        assert isinstance(result, NoopMonitoringService)

    @patch.object(SentryMonitoringService, "init", side_effect=Exception("bad dsn"))
    def test_logs_warning_on_init_failure(self, mock_init):
        with patch("logging.Logger.warning") as mock_warn:
            monitoring_service.init_monitoring(dsn="bad")
            mock_warn.assert_called_once()
