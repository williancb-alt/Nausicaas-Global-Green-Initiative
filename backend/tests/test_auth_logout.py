from http import HTTPStatus

from nausicass_global_green_initiative_api.models.token_blacklist import BlacklistedToken
from tests.util import (
    register_user,
    login_user,
    logout_user,
    WWW_AUTH_NO_TOKEN,
    get_access_token_from_cookie,
)

SUCCESS = "successfully logged out"
TOKEN_BLACKLISTED = "Token blacklisted. Please log in again."
WWW_AUTH_BLACKLISTED_TOKEN = (
    f"{WWW_AUTH_NO_TOKEN}, "
    'error="invalid_token", '
    f'error_description="{TOKEN_BLACKLISTED}"'
)


def test_logout(client, db):
    register_user(client)
    login_response = login_user(client)
    access_token = get_access_token_from_cookie(login_response)
    assert access_token is not None
    blacklist = BlacklistedToken.query.all()
    assert len(blacklist) == 0
    response = logout_user(client)
    assert response.status_code == HTTPStatus.OK
    assert "status" in response.json and response.json["status"] == "success"
    assert "message" in response.json and response.json["message"] == SUCCESS
    blacklist = BlacklistedToken.query.all()
    assert len(blacklist) == 1
    assert access_token == blacklist[0].token


def test_logout_token_blacklisted(client, db):
    register_user(client)
    login_response = login_user(client)
    access_token = get_access_token_from_cookie(login_response)
    assert access_token is not None
    response = logout_user(client)
    assert response.status_code == HTTPStatus.OK
    client.set_cookie("access_token", access_token)
    response = logout_user(client)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "message" in response.json and response.json["message"] == TOKEN_BLACKLISTED
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == WWW_AUTH_BLACKLISTED_TOKEN
