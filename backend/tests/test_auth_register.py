from http import HTTPStatus
from unittest.mock import MagicMock

from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.email_service import EmailService
from tests.util import (
    BAD_REQUEST,
    EMAIL,
    PASSWORD,
    get_access_token_from_cookie,
    register_user,
)

SUCCESS = "successfully registered"
EMAIL_ALREADY_EXISTS = f"{EMAIL} is already registered"


def test_auth_register(client, db):
    response = register_user(client)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    assert "message" in response.json and response.json["message"] == SUCCESS
    assert "token_type" in response.json and response.json["token_type"] == "bearer"
    assert "expires_in" in response.json and response.json["expires_in"] == 5
    assert "access_token" not in response.json
    access_token = get_access_token_from_cookie(response)
    assert access_token is not None
    result = User.decode_access_token(access_token)
    assert result.success
    user_dict = result.value
    assert not user_dict["admin"]
    user = User.find_by_public_id(user_dict["public_id"])
    assert user and user.email == EMAIL


def test_auth_register_email_already_registered(client, db):
    user = User(email=EMAIL, password=PASSWORD)
    db.session.add(user)
    db.session.commit()
    response = register_user(client)
    assert response.status_code == HTTPStatus.CONFLICT
    assert (
        "message" in response.json and response.json["message"] == EMAIL_ALREADY_EXISTS
    )
    assert "token_type" not in response.json
    assert "expires_in" not in response.json
    assert "access_token" not in response.json


def test_auth_register_invalid_email(client):
    invalid_email = "first last"
    response = register_user(client, email=invalid_email)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "token_type" not in response.json
    assert "expires_in" not in response.json
    assert "access_token" not in response.json
    assert "errors" in response.json
    assert "password" not in response.json["errors"]
    assert "email" in response.json["errors"]
    assert response.json["errors"]["email"] == f"{invalid_email} is not a valid email"


def test_register_triggers_welcome_email_once_on_success(client, db, monkeypatch):
    import threading

    sent = {"args": None}
    email_sent = threading.Event()

    def fake_send_email(*args, **kwargs):
        sent["args"] = (args, kwargs)
        email_sent.set()

    monkeypatch.setattr(EmailService, "send_email", fake_send_email)

    response = register_user(client, email=EMAIL, password=PASSWORD)
    assert response.status_code == HTTPStatus.CREATED

    assert email_sent.wait(timeout=2), "Welcome email was not sent within timeout"
    _, kwargs = sent["args"]
    assert kwargs["to"] == [EMAIL]
    assert "Welcome to Nausicaas Global Green Initiative" in kwargs["subject"]


def test_register_does_not_trigger_welcome_email_on_conflict(client, db, monkeypatch):
    user = User(email=EMAIL, password=PASSWORD)
    db.session.add(user)
    db.session.commit()

    fake = MagicMock()
    monkeypatch.setattr(EmailService, "send_email", fake)

    response = register_user(client, email=EMAIL, password=PASSWORD)
    assert response.status_code == HTTPStatus.CONFLICT
    fake.assert_not_called()


def test_auth_register_password_too_short(client):
    response = register_user(client, password="Short1A")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in response.json
    assert "password" in response.json["errors"]


def test_auth_register_password_no_uppercase(client):
    response = register_user(client, password="test12345")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in response.json
    assert "password" in response.json["errors"]


def test_auth_register_password_no_number(client):
    response = register_user(client, password="Testtest")
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "errors" in response.json
    assert "password" in response.json["errors"]
