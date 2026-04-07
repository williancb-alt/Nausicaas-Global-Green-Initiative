from typing import Any, Optional

import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from .monitoring_interface import MonitoringService, MonitoringTransaction
from .sentry_transaction import SentryTransaction


class SentryMonitoringService(MonitoringService):
    """
    Sentry implementation of the monitoring interface.
    """

    def init(self, **kwargs: Any) -> None:
        sentry_sdk.init(
            dsn=kwargs["dsn"],
            environment=kwargs.get("environment", "production"),
            release=kwargs.get("release"),
            traces_sample_rate=kwargs.get("traces_sample_rate", 1.0),
            profiles_sample_rate=kwargs.get("profiles_sample_rate", 0.1),
            send_default_pii=True,
            integrations=[
                FlaskIntegration(
                    transaction_style="url",
                ),
                SqlalchemyIntegration(),
            ],
            # Capture all request bodies for max detail
            max_request_body_size="always",
            # Attach server name for tracing
            server_name=kwargs.get("server_name"),
            debug=kwargs.get("debug", False),
        )

    def capture_exception(
        self, error: BaseException, context: Optional[dict] = None
    ) -> None:
        with sentry_sdk.push_scope() as scope:
            if context:
                for key, value in context.items():
                    scope.set_extra(key, value)
            sentry_sdk.capture_exception(error)

    def capture_message(self, message: str, level: str = "info") -> None:
        sentry_sdk.capture_message(message, level=level)

    def set_user(self, user: Optional[dict]) -> None:
        sentry_sdk.set_user(user)

    def add_breadcrumb(
        self,
        category: str,
        message: str,
        level: str = "info",
        data: Optional[dict] = None,
    ) -> None:
        sentry_sdk.add_breadcrumb(
            category=category,
            message=message,
            level=level,
            data=data or {},
        )

    def start_transaction(
        self, name: str, op: str, **kwargs: Any
    ) -> MonitoringTransaction:
        return SentryTransaction(name=name, op=op, **kwargs)

    def set_tag(self, key: str, value: str) -> None:
        sentry_sdk.set_tag(key, value)

    def set_context(self, name: str, context: dict) -> None:
        sentry_sdk.set_context(name, context)
