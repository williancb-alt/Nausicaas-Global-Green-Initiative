from typing import Any, Optional

from .monitoring_interface import MonitoringService, MonitoringTransaction


class _NoopTransaction(MonitoringTransaction):
    def finish(self) -> None:
        pass

    def set_status(self, status: str) -> None:
        pass


_noop_transaction = _NoopTransaction()


class NoopMonitoringService(MonitoringService):
    """
    Implementation used when no monitoring backend is configured.
    All methods are implemented as no-ops to avoid errors
    if monitoring is not initialised.
    """

    def init(self, **kwargs: Any) -> None:
        pass

    def capture_exception(
        self, error: BaseException, context: Optional[dict] = None
    ) -> None:
        pass

    def capture_message(self, message: str, level: str = "info") -> None:
        pass

    def set_user(self, user: Optional[dict]) -> None:
        pass

    def add_breadcrumb(
        self,
        category: str,
        message: str,
        level: str = "info",
        data: Optional[dict] = None,
    ) -> None:
        pass

    def start_transaction(
        self, name: str, op: str, **kwargs: Any
    ) -> MonitoringTransaction:
        return _noop_transaction

    def set_tag(self, key: str, value: str) -> None:
        pass

    def set_context(self, name: str, context: dict) -> None:
        pass
