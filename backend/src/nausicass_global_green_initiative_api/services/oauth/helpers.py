from __future__ import annotations

from http import HTTPStatus
from urllib.parse import urlencode

from flask import Response, current_app

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.user_oauth_account import (
    UserOAuthAccount,
)
from nausicass_global_green_initiative_api.api.auth.handlers import (
    _create_auth_successful_response,
)

from nausicass_global_green_initiative_api.services.oauth.core import logger


def _frontend_base_url() -> str:
    """Frontend base URL without trailing slash, for building redirects."""
    return current_app.config["FRONTEND_URL"].rstrip("/")


def redirect_to_frontend_with_error(error: str) -> Response:
    """Redirect to frontend with oauth_error query param for UI to show a message."""
    base = _frontend_base_url()
    sep = "&" if "?" in base else "?"
    location = f"{base}{sep}{urlencode({'oauth_error': error})}"
    resp = Response(status=303)
    resp.headers["Location"] = location
    return resp


def get_or_create_oauth_user(
    provider: str,
    provider_id: str,
    email: str | None,
    fallback_email: str,
) -> User:
    """Find user by provider, or by email (link), or create new OAuth-only user."""
    account = UserOAuthAccount.find_by_provider(provider, provider_id)
    if account is not None:
        return account.user
    existing = User.find_by_email(email) if email else None
    if existing is not None:
        account = UserOAuthAccount(
            user_id=existing.id, provider=provider, provider_id=provider_id
        )
        db.session.add(account)
        db.session.commit()
        return existing
    user = User(email=email or fallback_email)
    db.session.add(user)
    db.session.flush()
    account = UserOAuthAccount(
        user_id=user.id, provider=provider, provider_id=provider_id
    )
    db.session.add(account)
    db.session.commit()
    return user


def complete_oauth_login(user: User, provider: str) -> Response:
    """Complete OAuth login by encoding token and redirecting to frontend."""
    try:
        access_token = user.encode_access_token()
        resp = _create_auth_successful_response(
            token=access_token,
            status_code=HTTPStatus.OK,
            message=f"successfully logged in with {provider.capitalize()}",
        )
        resp.status_code = HTTPStatus.SEE_OTHER
        resp.headers["Location"] = _frontend_base_url()
        return resp
    except Exception as e:
        logger.exception("OAuth post-login failed: %s", e)
        return redirect_to_frontend_with_error("login_failed")
