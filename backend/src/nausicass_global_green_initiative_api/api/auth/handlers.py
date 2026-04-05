# Nausicaas Global Green Initiative API - Auth Handlers
# Version: 1.0.0

import threading
from http import HTTPStatus

from flask import Response, current_app, jsonify, render_template
from flask_restx import abort

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.api.auth.decorators import token_required
from nausicass_global_green_initiative_api.models.password_reset_token import (
    PasswordResetToken,
)
from nausicass_global_green_initiative_api.models.token_blacklist import BlacklistedToken
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.email_service import EmailService
from nausicass_global_green_initiative_api.util.datetime_util import (
    format_timespan_digits,
    remaining_fromtimestamp,
)


def _oauth_only_login_message(provider_names: list[str]) -> str:
    """Inform users that try to sign in with password when OAuth account."""
    if not provider_names:
        return (
            "This account uses sign-in with a provider. "
            "Use the buttons below to sign in."
        )
    provider_display_names = {
        "google": "Google",
        "github": "GitHub",
    }

    names = [
        provider_display_names.get(p, p.capitalize()) for p in sorted(provider_names)
    ]

    if len(names) == 1:
        return (
            f"This account uses sign-in with {names[0]}. "
            "Use the button below to sign in."
        )
    return (
        f"This account uses sign-in with {' or '.join(names)}. "
        "Use the buttons below to sign in."
    )


def _send_welcome_email_async(app, email: str) -> None:
    with app.app_context():
        try:
            html_body = render_template("email/welcome.html", email=email)
            plain_body = f"Your account {email} has been created."
            EmailService.send_email(
                to=[email],
                subject="Welcome to Nausicaas Global Green Initiative",
                html_body=html_body,
                plain_body=plain_body,
            )
        except Exception:
            app.logger.exception("Failed to send welcome email")


def process_registration_request(email: str, password: str) -> Response:
    if User.find_by_email(email):
        abort(HTTPStatus.CONFLICT, f"{email} is already registered", status="fail")
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    app = current_app._get_current_object()
    threading.Thread(
        target=_send_welcome_email_async,
        args=(app, email),
        daemon=True,
    ).start()
    access_token = new_user.encode_access_token()
    return _create_auth_successful_response(
        token=access_token,
        status_code=HTTPStatus.CREATED,
        message="successfully registered",
    )


def process_login_request(email: str, password: str) -> Response:
    user = User.find_by_email(email)
    if not user:
        abort(HTTPStatus.UNAUTHORIZED, "email or password does not match", status="fail")
    try:
        password_valid = user.check_password(password)
    except (ValueError, TypeError):
        current_app.logger.exception("Password verification failed for user %s", email)
        abort(HTTPStatus.UNAUTHORIZED, "email or password does not match", status="fail")
    if not password_valid:
        if user.password_hash is None:
            provider_names = sorted([a.provider for a in user.oauth_accounts.all()])
            message = _oauth_only_login_message(provider_names)
            response = jsonify(
                status="fail",
                message=message,
                oauth_providers=provider_names,
            )
            response.status_code = HTTPStatus.UNAUTHORIZED
            return response
        abort(HTTPStatus.UNAUTHORIZED, "email or password does not match", status="fail")
    access_token = user.encode_access_token()
    return _create_auth_successful_response(
        token=access_token,
        status_code=HTTPStatus.OK,
        message="successfully logged in",
    )


def _create_auth_successful_response(
    token: str, status_code: HTTPStatus, message: str
) -> Response:
    expires_in = _get_token_expire_time()
    response = jsonify(
        status="success",
        message=message,
        token_type="bearer",
        expires_in=expires_in,
    )
    response.status_code = status_code
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"

    is_production = current_app.config.get("FLASK_ENV") == "production"

    response.set_cookie(
        "access_token",
        token,
        httponly=True,
        secure=is_production,
        samesite="Lax",
        max_age=expires_in,
        path="/",
    )
    return response


def _get_token_expire_time() -> int:
    token_age_h = current_app.config.get("TOKEN_EXPIRE_HOURS")
    token_age_m = current_app.config.get("TOKEN_EXPIRE_MINUTES")
    expires_in_seconds = token_age_h * 3600 + token_age_m * 60
    return expires_in_seconds if not current_app.config["TESTING"] else 5


@token_required
def get_logged_in_user() -> User:
    public_id = get_logged_in_user.public_id  # type: ignore[attr-defined]
    user = User.find_by_public_id(public_id)
    expires_at = get_logged_in_user.expires_at  # type: ignore[attr-defined]
    user.token_expires_in = format_timespan_digits(remaining_fromtimestamp(expires_at))
    return user


@token_required
def process_logout_request() -> Response:
    access_token = process_logout_request.token  # type: ignore[attr-defined]
    expires_at = process_logout_request.expires_at  # type: ignore[attr-defined]
    blacklisted_token = BlacklistedToken(access_token, expires_at)
    db.session.add(blacklisted_token)
    db.session.commit()
    response = jsonify(dict(status="success", message="successfully logged out"))
    response.set_cookie("access_token", "", expires=0)
    return response


def _send_reset_email_async(app, email: str, raw_token: str) -> None:
    with app.app_context():
        try:
            frontend_url = app.config.get("FRONTEND_URL", "")
            reset_link = f"{frontend_url}/reset-password?token={raw_token}"
            html_body = render_template(
                "email/password_reset.html",
                email=email,
                reset_link=reset_link,
            )
            plain_body = (
                f"A password reset was requested for {email}. "
                f"Visit the following link to reset your password: {reset_link}"
            )
            EmailService.send_email(
                to=[email],
                subject="Password Reset - Nausicaas Global Green Initiative",
                html_body=html_body,
                plain_body=plain_body,
            )
        except Exception:
            app.logger.exception("Failed to send password reset email")


def process_forgot_password_request(email: str) -> Response:
    """Always returns success to prevent email enumeration."""
    user = User.find_by_email(email)
    if user:
        token_model, raw_token = PasswordResetToken.create(user.id)
        db.session.commit()
        app = current_app._get_current_object()
        if app.config.get("TESTING"):
            _send_reset_email_async(app, email, raw_token)
        else:
            threading.Thread(
                target=_send_reset_email_async,
                args=(app, email, raw_token),
                daemon=True,
            ).start()
    response = jsonify(
        status="success",
        message="If that email is registered, a reset link has been sent.",
    )
    response.status_code = HTTPStatus.OK
    return response


def process_reset_password_request(token: str, password: str) -> Response:
    reset_token = PasswordResetToken.find_valid_token(token)
    if not reset_token:
        abort(
            HTTPStatus.BAD_REQUEST,
            "Reset token is invalid or has expired.",
            status="fail",
        )
    user = db.session.get(User, reset_token.user_id)
    user.password = password
    reset_token.used = True
    db.session.commit()
    response = jsonify(
        status="success",
        message="Password has been reset successfully.",
    )
    response.status_code = HTTPStatus.OK
    return response
