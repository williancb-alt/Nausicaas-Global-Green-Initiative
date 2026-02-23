from http import HTTPStatus

from nausicass_global_green_initiative_api.models.user import User
from tests.util import EMAIL, register_user, login_user, get_access_token_from_cookie

SUCCESS = "successfully logged in"
UNAUTHORIZED = "email or password does not match"
OAUTH_ONLY_MSG_GOOGLE = (
    "This account uses sign-in with Google. Use the button below to sign in."
)


def test_login(client, db):
    register_user(client)
    response = login_user(client)
    assert response.status_code == HTTPStatus.OK
    assert "status" in response.json and response.json["status"] == "success"
    assert "message" in response.json and response.json["message"] == SUCCESS
    assert "access_token" not in response.json
    access_token = get_access_token_from_cookie(response)
    assert access_token is not None
    result = User.decode_access_token(access_token)
    assert result.success
    token_payload = result.value
    assert not token_payload["admin"]
    user = User.find_by_public_id(token_payload["public_id"])
    assert user and user.email == EMAIL


def test_login_email_does_not_exist(client, db):
    response = login_user(client)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "message" in response.json and response.json["message"] == UNAUTHORIZED
    assert "access_token" not in response.json


def test_login_oauth_only_user_returns_401_and_message(client, db):
    """OAuth user (no password) gets 401 with OAuth-only message and providers."""
    from nausicass_global_green_initiative_api.models.user_oauth_account import (
        UserOAuthAccount,
    )

    with client.application.app_context():
        oauth_user = User(email=EMAIL)
        db.session.add(oauth_user)
        db.session.flush()
        db.session.add(
            UserOAuthAccount(
                user_id=oauth_user.id, provider="google", provider_id="google-123"
            )
        )
        db.session.commit()

    response = login_user(client)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json.get("message") == OAUTH_ONLY_MSG_GOOGLE
    assert response.json.get("oauth_providers") == ["google"]
    assert response.json.get("status") == "fail"


def test_login_oauth_only_user_with_two_providers_returns_both(client, db):
    """OAuth-only user with Google and GitHub gets message listing both providers."""
    from nausicass_global_green_initiative_api.models.user_oauth_account import (
        UserOAuthAccount,
    )

    with client.application.app_context():
        oauth_user = User(email=EMAIL)
        db.session.add(oauth_user)
        db.session.flush()
        db.session.add(
            UserOAuthAccount(
                user_id=oauth_user.id, provider="google", provider_id="google-123"
            )
        )
        db.session.add(
            UserOAuthAccount(
                user_id=oauth_user.id, provider="github", provider_id="github-456"
            )
        )
        db.session.commit()

    response = login_user(client)
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "Google" in response.json.get("message", "")
    assert "GitHub" in response.json.get("message", "")
    assert set(response.json.get("oauth_providers", [])) == {"google", "github"}
