from dataclasses import dataclass
import smtplib

import pytest
from flask import Flask

from nausicass_global_green_initiative_api.services.email_service import (
    EmailService,
    EmailSendError,
)

def _configure_app_email_defaults(app: Flask) -> None:
    app.config["SMTP_SERVER"] = "smtp.example.com"
    app.config["SMTP_USERNAME"] = "user"
    app.config["SMTP_PASSWORD"] = "pass"
    app.config["SMTP_SENDER"] = "no-reply@example.com"


class MockSMTP:
    def __init__(self, *args, **kwargs):
        self.sent_messages = []
        self.logins = []
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
    
    def ehlo(self):
        pass
    
    def starttls(self):
        pass
    
    def login(self, username, password):
        self.logins.append((username, password))
    
    def send_message(self, msg):
        self.sent_messages.append(msg)


def test_send_email_enabled_flag_controls_call(app: Flask, monkeypatch) -> None:
    mock_smtp_client = MockSMTP()
    monkeypatch.setattr("smtplib.SMTP", lambda *args, **kwargs: mock_smtp_client)
    monkeypatch.setattr("smtplib.SMTP_SSL", lambda *args, **kwargs: mock_smtp_client)

    with app.app_context():
        _configure_app_email_defaults(app)
        app.config["EMAIL_ENABLED"] = "false"
        result = EmailService.send_email(
            to=["user@example.com"],
            subject="Hi",
            html_body="<p>Hi</p>",
        )
        assert result is None
        assert not mock_smtp_client.sent_messages

        app.config["EMAIL_ENABLED"] = "true"
        result = EmailService.send_email(
            to=["user@example.com"],
            subject="Hi",
            html_body="<p>Hi</p>",
        )
        assert result is not None
        assert len(mock_smtp_client.sent_messages) == 1
        assert "Hi" in mock_smtp_client.sent_messages[0]["Subject"]

def test_send_email_local_mock_fallback(app: Flask, monkeypatch) -> None:
    mock_smtp_client = MockSMTP()
    monkeypatch.setattr("smtplib.SMTP", lambda *args, **kwargs: mock_smtp_client)

    with app.app_context():
        app.config["SMTP_SERVER"] = ""
        app.config["EMAIL_ENABLED"] = "true"
        result = EmailService.send_email(
            to=["user@example.com"],
            subject="Fallback Subject",
            html_body="<p>Hi</p>",
        )
        assert result == "local-mock-message-id"
        assert len(mock_smtp_client.sent_messages) == 0

def test_send_email_raises_on_error(app: Flask, monkeypatch) -> None:
    class FailingSMTP:
        def __init__(self, *args, **kwargs):
            pass
        
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            pass
        
        def ehlo(self):
            pass

        def login(self, *args):
            raise smtplib.SMTPAuthenticationError(535, b"Auth failed")

    monkeypatch.setattr("smtplib.SMTP", lambda *args, **kwargs: FailingSMTP())

    with app.app_context():
        _configure_app_email_defaults(app)
        app.config["EMAIL_ENABLED"] = "true"
        with pytest.raises(EmailSendError):
            EmailService.send_email(
                to=["user@example.com"],
                subject="Test",
                html_body="<p>Hi</p>",
            )
