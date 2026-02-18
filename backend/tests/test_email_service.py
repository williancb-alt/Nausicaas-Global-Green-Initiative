from dataclasses import dataclass

import pytest
from azure.core.exceptions import ServiceRequestError, HttpResponseError
from flask import Flask

from nausicass_global_green_initiative_api.services.email_service import (
    EmailService,
    EmailSendError,
)


@dataclass(frozen=True)
class EmailEnabledCase:
    email_enabled: object
    expected_called: bool
    message_id_value: str | None


class DummyPoller:
    def __init__(self, result):
        self._result = result

    def result(self, timeout=None):
        return self._result


class DummyResult:
    def __init__(self, message_id: str = "mid-123") -> None:
        self.message_id = message_id


class DummyHttpError(HttpResponseError):
    def __init__(self, status_code: int) -> None:
        super().__init__(message="error")
        self.status_code = status_code


def _configure_app_email_defaults(app: Flask) -> None:
    app.config["ACS_EMAIL_SENDER"] = "no-reply@example.com"
    app.config["ACS_EMAIL_CONNECTION_STRING"] = "endpoint=...;accesskey=..."


def _set_client(monkeypatch, client_cls) -> None:
    monkeypatch.setattr(
        "nausicass_global_green_initiative_api.services.email_service.EmailService._get_client",  # noqa: E501
        lambda: client_cls(),
    )


@pytest.mark.parametrize(
    "case",
    [
        EmailEnabledCase("false", False, None),
        EmailEnabledCase(True, True, "ok-1"),
    ],
)
def test_send_email_enabled_flag_controls_call(
    app: Flask,
    monkeypatch,
    case: EmailEnabledCase,
) -> None:
    calls: list[dict] = []

    class RecordingClient:
        def begin_send(self, message):
            calls.append(message)
            return DummyPoller(DummyResult(case.message_id_value or "ignored"))

    with app.app_context():
        _configure_app_email_defaults(app)
        app.config["EMAIL_ENABLED"] = case.email_enabled

        monkeypatch.setattr(  # noqa: E501
            "nausicass_global_green_initiative_api.services.email_service.EmailService._get_client",  # noqa: E501
            lambda: RecordingClient(),
        )

        result = EmailService.send_email(
            to=["user@example.com"],
            subject="Hi",
            html_body="<p>Hi</p>",
        )

    if case.expected_called:
        assert calls
        assert result == case.message_id_value
    else:
        assert not calls
        assert result is None


def test_send_email_retries_on_service_request_error(
    app: Flask,
    monkeypatch,
) -> None:
    attempts = {"count": 0}

    class DummyClient:
        def begin_send(self, message):
            if attempts["count"] < 1:
                attempts["count"] += 1
                raise ServiceRequestError("transient")
            return DummyPoller(DummyResult("ok-after-retry"))

    with app.app_context():
        app.config["EMAIL_ENABLED"] = True
        _configure_app_email_defaults(app)
        app.config["ACS_EMAIL_MAX_RETRIES"] = 2

        _set_client(monkeypatch, DummyClient)

        message_id = EmailService.send_email(
            to=["user@example.com"],
            subject="Welcome",
            html_body="<p>Welcome</p>",
        )

    assert attempts["count"] == 1
    assert message_id == "ok-after-retry"


def test_send_email_raises_after_non_retryable_http_error(
    app: Flask,
    monkeypatch,
) -> None:
    class DummyClient:
        def begin_send(self, message):
            raise DummyHttpError(status_code=400)

    with app.app_context():
        app.config["EMAIL_ENABLED"] = True
        _configure_app_email_defaults(app)
        app.config["ACS_EMAIL_MAX_RETRIES"] = 2

        _set_client(monkeypatch, DummyClient)

        with pytest.raises(EmailSendError):
            EmailService.send_email(
                to=["user@example.com"],
                subject="Welcome",
                html_body="<p>Welcome</p>",
            )
