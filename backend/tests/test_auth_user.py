import time
from http import HTTPStatus

from flask import url_for
from tests.util import (
    EMAIL,
    WWW_AUTH_NO_TOKEN,
    register_user,
    login_user,
    get_user,
    get_access_token_from_cookie,
)

TOKEN_EXPIRED = "Access token expired. Please log in again."
WWW_AUTH_EXPIRED_TOKEN = (
    f"{WWW_AUTH_NO_TOKEN}, "
    'error="invalid_token", '
    f'error_description="{TOKEN_EXPIRED}"'
)


def test_auth_user(client, db):
    register_user(client)
    login_user(client)
    response = get_user(client)
    assert response.status_code == HTTPStatus.OK
    assert "email" in response.json and response.json["email"] == EMAIL
    assert "admin" in response.json and not response.json["admin"]


def test_auth_user_no_token(client, db):
    response = client.get(url_for("api.auth_user"))
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "message" in response.json and response.json["message"] == "Unauthorized"
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == WWW_AUTH_NO_TOKEN


def test_auth_user_expired_token(client, db):
    register_user(client)
    login_response = login_user(client)
    access_token = get_access_token_from_cookie(login_response)
    assert access_token is not None
    time.sleep(6)
    response = get_user(client)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "message" in response.json and response.json["message"] == TOKEN_EXPIRED
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == WWW_AUTH_EXPIRED_TOKEN
