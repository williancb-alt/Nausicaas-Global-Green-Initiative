from flask import Response, url_for, current_app

from nausicass_global_green_initiative_api.services.oauth.core import logger, oauth
from nausicass_global_green_initiative_api.services.oauth.helpers import (
    complete_oauth_login,
    get_or_create_oauth_user,
    redirect_to_frontend_with_error,
)


class GoogleOAuthProvider:
    """OAuth provider for Google (OpenID Connect)."""

    name = "google"

    def start_login(self) -> Response:
        env_name = current_app.config.get("ENV", "production")
        is_local = current_app.debug or env_name == "development"

        if is_local:
            redirect_uri = url_for(
                "api.auth_oauth_callback", provider=self.name, _external=True
            )
        else:
            redirect_uri = url_for(
                "api.auth_oauth_callback",
                provider=self.name,
                _external=True,
                _scheme="https",
            )

        return oauth.google.authorize_redirect(redirect_uri)

    def handle_callback(self) -> Response:
        try:
            oauth.google.authorize_access_token()
            userinfo = oauth.google.userinfo()
        except Exception as e:
            logger.exception("OAuth callback failed: %s", e)
            return redirect_to_frontend_with_error("login_failed")

        provider_id = userinfo["sub"]
        email = userinfo.get("email")

        user = get_or_create_oauth_user(
            self.name, provider_id, email, f"{provider_id}@google.oauth.local"
        )
        return complete_oauth_login(user, self.name)
