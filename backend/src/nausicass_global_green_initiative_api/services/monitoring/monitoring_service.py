from .monitoring_interface import MonitoringService
from .noop_monitoring import NoopMonitoringService
from .sentry_monitoring import SentryMonitoringService

# Default to a no-op monitoring service to avoid errors
# if monitoring is not initialised
_instance: MonitoringService = NoopMonitoringService()


def init_monitoring(**kwargs) -> MonitoringService:
    """
    Initialise the global monitoring service
    with given config. Falls back to noop on failure.
    """
    global _instance

    try:
        service = SentryMonitoringService()
        service.init(**kwargs)
        _instance = service
    except Exception:
        import logging

        logging.getLogger(__name__).warning(
            "Failed to initialise Sentry, falling back to noop monitoring",
            exc_info=True,
        )

    return _instance


def get_monitoring() -> MonitoringService:
    """
    Return the monitoring service
    """

    return _instance
