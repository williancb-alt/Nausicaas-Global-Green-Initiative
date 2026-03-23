from http import HTTPStatus
from unittest.mock import MagicMock

from nausicass_global_green_initiative_api.models.password_reset_token import (
    PasswordResetToken,
)
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.email_service import EmailService
from tests.util import (
    EMAIL,
    PASSWORD,
    forgot_password,
    login_user,
    register_user,
    reset_password,
)

NEW_PASSWORD = "NewPass1"
GENERIC_MESSAGE = "If that email is registered, a reset link has been sent."
RESET_SUCCESS = "Password has been reset successfully."
INVALID_TOKEN = "Reset token is invalid or has expired."


def test_forgot_password_registered_email(client, db, monkeypatch):
    register_user(client)
    sent = {"kwargs": None}

    def fake_send_email(*args, **kwargs):
        sent["kwargs"] = kwargs

    monkeypatch.setattr(EmailService, "send_email", fake_send_email)

    response = forgot_password(client)
    assert response.status_code == HTTPStatus.OK
    assert response.json["message"] == GENERIC_MESSAGE

    assert sent["kwargs"] is not None
    assert sent["kwargs"]["to"] == [EMAIL]
    assert "Password Reset" in sent["kwargs"]["subject"]


def test_forgot_password_unregistered_email(client, db):
    response = forgot_password(client, email="nobody@example.com")
    assert response.status_code == HTTPStatus.OK
    assert response.json["message"] == GENERIC_MESSAGE


def test_forgot_password_no_email_sent_for_unknown_user(client, db, monkeypatch):
    fake = MagicMock()
    monkeypatch.setattr(EmailService, "send_email", fake)

    forgot_password(client, email="nobody@example.com")
    fake.assert_not_called()


def test_forgot_password_invalid_email(client, db):
    response = forgot_password(client, email="not-an-email")
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_reset_password_success(client, db, monkeypatch):
    register_user(client)
    monkeypatch.setattr(EmailService, "send_email", lambda *a, **kw: None)

    user = User.find_by_email(EMAIL)
    token_model, raw_token = PasswordResetToken.create(user.id)
    db.session.commit()

    response = reset_password(client, token=raw_token, password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.OK
    assert response.json["message"] == RESET_SUCCESS

    user = User.find_by_email(EMAIL)
    assert user.check_password(NEW_PASSWORD)
    assert not user.check_password(PASSWORD)


def test_reset_password_can_login_with_new_password(client, db):
    register_user(client)

    user = User.find_by_email(EMAIL)
    token_model, raw_token = PasswordResetToken.create(user.id)
    db.session.commit()

    reset_password(client, token=raw_token, password=NEW_PASSWORD)

    response = login_user(client, password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.OK
    assert response.json["status"] == "success"


def test_reset_password_invalid_token(client, db):
    response = reset_password(client, token="bogus-token", password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json["message"] == INVALID_TOKEN


def test_reset_password_used_token(client, db):
    register_user(client)

    user = User.find_by_email(EMAIL)
    token_model, raw_token = PasswordResetToken.create(user.id)
    db.session.commit()

    response = reset_password(client, token=raw_token, password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.OK

    response = reset_password(client, token=raw_token, password="Another1")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json["message"] == INVALID_TOKEN


def test_reset_password_expired_token(client, db):
    from datetime import timedelta

    from nausicass_global_green_initiative_api.util.datetime_util import utc_now

    register_user(client)

    user = User.find_by_email(EMAIL)
    token_model, raw_token = PasswordResetToken.create(user.id)
    token_model.expires_at = utc_now() - timedelta(minutes=1)
    db.session.commit()

    response = reset_password(client, token=raw_token, password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json["message"] == INVALID_TOKEN


def test_reset_password_weak_password(client, db):
    register_user(client)

    user = User.find_by_email(EMAIL)
    token_model, raw_token = PasswordResetToken.create(user.id)
    db.session.commit()

    response = reset_password(client, token=raw_token, password="weak")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in response.json
    assert "password" in response.json["errors"]


def test_forgot_password_invalidates_old_tokens(client, db):
    register_user(client)

    user = User.find_by_email(EMAIL)
    _, first_token = PasswordResetToken.create(user.id)
    db.session.commit()
    _, second_token = PasswordResetToken.create(user.id)
    db.session.commit()

    response = reset_password(client, token=first_token, password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json["message"] == INVALID_TOKEN

    response = reset_password(client, token=second_token, password=NEW_PASSWORD)
    assert response.status_code == HTTPStatus.OK
