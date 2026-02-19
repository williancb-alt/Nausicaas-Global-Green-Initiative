from http import HTTPStatus

from flask import Flask, Response
from flask_restx import abort

from nausicass_global_green_initiative_api.services.oauth.core import (
    OAuthProvider,
    logger,
    oauth,
)
from nausicass_global_green_initiative_api.services.oauth.providers import (
    GitHubOAuthProvider,
    GoogleOAuthProvider,
)

PROVIDERS: dict[str, OAuthProvider] = {}
PROVIDER_CLASSES: dict[str, type[OAuthProvider]] = {
    "google": GoogleOAuthProvider,
    "github": GitHubOAuthProvider,
}


def init_oauth(app: Flask) -> None:
    oauth.init_app(app)
    for cfg in app.config["OAUTH_PROVIDERS"]:
        name = cfg["name"]
        if name not in PROVIDER_CLASSES:
            logger.warning("OAuth provider %r in config has no handler; skipping", name)
            continue
        oauth.register(**cfg)
        PROVIDERS[name] = PROVIDER_CLASSES[name]()


def start_oauth_login(provider: str) -> Response:
    if provider not in PROVIDERS:
        abort(HTTPStatus.NOT_FOUND, f"Unknown OAuth provider: {provider}", status="fail")
    return PROVIDERS[provider].start_login()


def handle_oauth_callback(provider: str) -> Response:
    if provider not in PROVIDERS:
        abort(HTTPStatus.NOT_FOUND, f"Unknown OAuth provider: {provider}", status="fail")
    return PROVIDERS[provider].handle_callback()
