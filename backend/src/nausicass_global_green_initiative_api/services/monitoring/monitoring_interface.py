from abc import ABC, abstractmethod
from typing import Any, Optional


class MonitoringTransaction(ABC):
    @abstractmethod
    def finish(self) -> None:
        pass

    @abstractmethod
    def set_status(self, status: str) -> None:
        pass


class MonitoringService(ABC):
    """
    Abstract monitoring interface.

    Swap the concrete implementation (e.g. Sentry -> Datadog)
    without touching any call-site code.
    """

    @abstractmethod
    def init(self, **kwargs: Any) -> None:
        pass

    @abstractmethod
    def capture_exception(
        self, error: BaseException, context: Optional[dict] = None
    ) -> None:
        pass

    @abstractmethod
    def capture_message(self, message: str, level: str = "info") -> None:
        pass

    @abstractmethod
    def set_user(self, user: Optional[dict]) -> None:
        pass

    @abstractmethod
    def add_breadcrumb(
        self,
        category: str,
        message: str,
        level: str = "info",
        data: Optional[dict] = None,
    ) -> None:
        pass

    @abstractmethod
    def start_transaction(
        self, name: str, op: str, **kwargs: Any
    ) -> MonitoringTransaction:
        pass

    @abstractmethod
    def set_tag(self, key: str, value: str) -> None:
        pass

    @abstractmethod
    def set_context(self, name: str, context: dict) -> None:
        pass
