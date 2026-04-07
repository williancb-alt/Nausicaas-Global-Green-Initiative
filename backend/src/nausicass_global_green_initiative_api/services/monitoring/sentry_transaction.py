from typing import Any

import sentry_sdk

from .monitoring_interface import MonitoringTransaction


# Wrapper around Sentry's transaction class
class SentryTransaction(MonitoringTransaction):
    def __init__(self, name: str, op: str, **kwargs: Any) -> None:
        self._span = sentry_sdk.start_span(name=name, op=op)

    def finish(self) -> None:
        self._span.__exit__(None, None, None)

    def set_status(self, status: str) -> None:
        self._span.set_status(status)
