from flask import Response, url_for

from nausicass_global_green_initiative_api.services.oauth.core import oauth, logger

from nausicass_global_green_initiative_api.services.oauth.helpers import (
    redirect_to_frontend_with_error,
    get_or_create_oauth_user,
    complete_oauth_login,
)


def _fetch_primary_email() -> str | None:
    """Fetch primary verified email from GitHub /user/emails when /user has no email."""
    try:
        emails_resp = oauth.github.get("https://api.github.com/user/emails")
        if emails_resp.status_code != 200:
            return None
        data = emails_resp.json()
        for entry in data:
            if entry.get("primary") and entry.get("verified"):
                return entry.get("email")
        return data[0].get("email") if data else None
    except Exception as e:
        logger.warning("GitHub emails fetch failed: %s", e)
        return None


class GitHubOAuthProvider:
    """OAuth provider for GitHub."""

    name = "github"

    def start_login(self) -> Response:
        redirect_uri = url_for(
            "api.auth_oauth_callback", provider=self.name, _external=True
        )
        return oauth.github.authorize_redirect(redirect_uri)

    def handle_callback(self) -> Response:
        try:
            oauth.github.authorize_access_token()
        except Exception as e:
            logger.exception("OAuth callback failed: %s", e)
            return redirect_to_frontend_with_error("login_failed")

        try:
            resp = oauth.github.get("https://api.github.com/user")
            if resp.status_code != 200:
                logger.warning("GitHub user request failed: %s", resp.text)
                return redirect_to_frontend_with_error("login_failed")
            userinfo = resp.json()
        except Exception as e:
            logger.exception("GitHub userinfo failed: %s", e)
            return redirect_to_frontend_with_error("login_failed")

        provider_id = str(userinfo["id"])
        email = userinfo.get("email") or _fetch_primary_email()

        user = get_or_create_oauth_user(
            self.name, provider_id, email, f"{provider_id}@github.oauth.local"
        )
        return complete_oauth_login(user, self.name)
