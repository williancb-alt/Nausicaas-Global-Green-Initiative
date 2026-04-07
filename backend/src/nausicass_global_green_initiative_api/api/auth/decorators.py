import logging
from functools import wraps
from typing import Any, Callable, TypedDict

from flask import request

from nausicass_global_green_initiative_api.api.exceptions import (
    ApiForbidden,
    ApiUnauthorized,
)
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.monitoring import get_monitoring

logger = logging.getLogger(__name__)


def _set_monitoring_user(public_id: str, admin: bool = False) -> None:
    """
    Set current user on the monitoring service for context.
    """

    monitoring = get_monitoring()
    monitoring.set_user({"id": public_id, "is_admin": str(admin)})
    monitoring.set_tag("user.role", "admin" if admin else "user")


class TokenPayload(TypedDict):
    """Type definition for decoded JWT token payload."""

    public_id: str
    admin: bool
    token: str
    expires_at: int


def token_required(f: Callable[..., Any]) -> Callable[..., Any]:
    """Only run function if request contains valid access token."""

    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        token_payload = _validate_access_token(admin_only=False)
        _set_monitoring_user(
            token_payload["public_id"], token_payload.get("admin", False)
        )
        for name, val in token_payload.items():
            setattr(decorated, name, val)
        return f(*args, **kwargs)

    return decorated


def admin_token_required(f: Callable[..., Any]) -> Callable[..., Any]:
    """Only run function if request contains valid access token AND user is admin."""

    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        token_payload = _validate_access_token(admin_only=True)
        user = User.find_by_public_id(token_payload["public_id"])
        if not user or not user.admin:
            logger.warning(
                "Access denied: admin required",
                extra={"user_id": token_payload["public_id"], "path": request.path},
            )
            raise ApiForbidden()
        token_payload["admin"] = user.admin
        _set_monitoring_user(token_payload["public_id"], user.admin)
        for name, val in token_payload.items():
            setattr(decorated, name, val)
        return f(*args, **kwargs)

    return decorated


def _validate_access_token(admin_only: bool) -> TokenPayload:
    token = request.cookies.get("access_token")
    if not token:
        logger.warning("Access denied: no token provided", extra={"path": request.path})
        raise ApiUnauthorized(description="Unauthorized", admin_only=admin_only)
    result = User.decode_access_token(token)
    if result.failure:
        logger.warning(
            "Access denied: invalid token",
            extra={"path": request.path, "error": result.error},
        )
        raise ApiUnauthorized(
            description=result.error,
            admin_only=admin_only,
            error="invalid_token",
            error_description=result.error,
        )
    return result.value
