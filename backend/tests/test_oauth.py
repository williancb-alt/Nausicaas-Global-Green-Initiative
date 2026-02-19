from http import HTTPStatus

from flask import url_for

from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.user_oauth_account import (
    UserOAuthAccount,
)
from tests.util import PASSWORD


def _oauth_helpers():
    """Lazy-load oauth helpers to avoid circular import at collection time."""
    from nausicass_global_green_initiative_api.services.oauth import helpers

    return helpers


def _oauth_registry():
    """Lazy-load oauth registry (PROVIDERS, init_oauth)."""
    from nausicass_global_green_initiative_api.services.oauth.registry import (
        PROVIDERS,
        init_oauth,
    )

    return PROVIDERS, init_oauth


def test_oauth_start_login_unknown_provider_returns_404(client, app):
    """GET /oauth/<unknown> returns 404."""
    with app.app_context():
        response = client.get(
            url_for("api.auth_oauth_login", provider="unknown_provider")
        )
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json.get("status") == "fail"
    assert "Unknown OAuth provider" in response.json.get("message", "")


def test_oauth_callback_unknown_provider_returns_404(client, app):
    """GET /oauth/<unknown>/callback returns 404."""
    with app.app_context():
        response = client.get(
            url_for("api.auth_oauth_callback", provider="unknown_provider")
        )
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json.get("status") == "fail"
    assert "Unknown OAuth provider" in response.json.get("message", "")


def test_oauth_start_login_google_redirects(client, app):
    """GET /oauth/google returns redirect to provider."""
    with app.app_context():
        response = client.get(url_for("api.auth_oauth_login", provider="google"))
    assert response.status_code in (HTTPStatus.FOUND, HTTPStatus.SEE_OTHER)
    location = response.headers.get("Location", "")
    assert "accounts.google.com" in location or "google" in location.lower()


def test_oauth_start_login_github_redirects(client, app):
    """GET /oauth/github returns redirect to provider."""
    with app.app_context():
        response = client.get(url_for("api.auth_oauth_login", provider="github"))
    assert response.status_code in (HTTPStatus.FOUND, HTTPStatus.SEE_OTHER)
    location = response.headers.get("Location", "")
    assert "github.com" in location


def test_oauth_providers_registered(app):
    """init_oauth registers google and github (from config + PROVIDER_CLASSES)."""
    PROVIDERS, _ = _oauth_registry()

    assert "google" in PROVIDERS
    assert "github" in PROVIDERS
    assert PROVIDERS["google"].name == "google"
    assert PROVIDERS["github"].name == "github"


def test_redirect_to_frontend_with_error(app):
    """redirect_to_frontend_with_error returns 303 and Location with oauth_error."""
    helpers = _oauth_helpers()

    app.config["FRONTEND_URL"] = "https://frontend.test"
    with app.app_context():
        resp = helpers.redirect_to_frontend_with_error("login_failed")
    assert resp.status_code == HTTPStatus.SEE_OTHER
    assert "oauth_error=login_failed" in resp.headers.get("Location", "")


def test_get_or_create_oauth_user_find_by_provider(app, db):
    """get_or_create_oauth_user returns existing user when provider+provider_id match."""
    helpers = _oauth_helpers()

    with app.app_context():
        existing = User(email="oauth@test.com")
        db.session.add(existing)
        db.session.commit()
        account = UserOAuthAccount(
            user_id=existing.id,
            provider="google",
            provider_id="google-123",
        )
        db.session.add(account)
        db.session.commit()
        result = helpers.get_or_create_oauth_user(
            "google", "google-123", "oauth@test.com", "fallback@x.local"
        )
        assert result is existing
        assert result.email == "oauth@test.com"
        oauth_accounts = list(result.oauth_accounts)
        assert len(oauth_accounts) == 1
        assert oauth_accounts[0].provider == "google"
        assert oauth_accounts[0].provider_id == "google-123"


def test_get_or_create_oauth_user_link_by_email(app, db):
    """get_or_create_oauth_user links provider to existing user when email matches."""
    from nausicass_global_green_initiative_api.services.oauth.helpers import (
        get_or_create_oauth_user,
    )

    with app.app_context():
        existing = User(email="link@test.com", password=PASSWORD)
        db.session.add(existing)
        db.session.commit()
        result = get_or_create_oauth_user(
            "github", "github-456", "link@test.com", "fallback@x.local"
        )
        account = UserOAuthAccount.find_by_provider("github", "github-456")

        assert result is existing
        assert account is not None
        assert account.user_id == existing.id


def test_get_or_create_oauth_user_creates_new(app, db):
    """get_or_create_oauth_user creates new user when no provider or email match."""
    from nausicass_global_green_initiative_api.services.oauth.helpers import (
        get_or_create_oauth_user,
    )

    with app.app_context():
        result = get_or_create_oauth_user(
            "google", "google-789", None, "new@oauth.local"
        )
        assert result.id is not None
        assert result.email == "new@oauth.local"
        oauth_accounts = list(result.oauth_accounts)
        assert len(oauth_accounts) == 1
        assert oauth_accounts[0].provider == "google"
        assert oauth_accounts[0].provider_id == "google-789"


def test_complete_oauth_login_success(app, db, user):
    """complete_oauth_login returns 303 redirect and sets cookie."""
    from nausicass_global_green_initiative_api.services.oauth.helpers import (
        complete_oauth_login,
    )

    app.config["FRONTEND_URL"] = "https://frontend.test"
    with app.app_context():
        resp = complete_oauth_login(user, "google")
        assert resp.status_code == HTTPStatus.SEE_OTHER
        assert resp.headers.get("Location") == "https://frontend.test"
        assert "access_token" in resp.headers.get("Set-Cookie", "")


def test_init_oauth_skips_provider_without_handler(app):
    """init_oauth skips provider that has no PROVIDER_CLASSES entry."""
    PROVIDERS, init_oauth = _oauth_registry()

    app.config.setdefault("OAUTH_PROVIDERS", []).append(
        {
            "name": "fake",
            "client_id": "fake-id",
            "client_secret": "fake-secret",
            "authorize_url": "https://fake.com/auth",
            "access_token_url": "https://fake.com/token",
            "client_kwargs": {"scope": "openid"},
        }
    )
    init_oauth(app)
    assert "fake" not in PROVIDERS
    assert "google" in PROVIDERS
    assert "github" in PROVIDERS
