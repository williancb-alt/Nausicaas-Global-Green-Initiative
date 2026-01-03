from typing import Any, List, Mapping, Optional, Tuple
from werkzeug.exceptions import Unauthorized, Forbidden

# TODO - update these when real domain in place
_REALM_REGULAR_USERS = "registered_users@mydomain.com"
_REALM_ADMIN_USERS = "admin_users@mydomain.com"


class ApiUnauthorized(Unauthorized):
    """Raise status code 401 with customizable WWW-Authenticate header."""

    def __init__(
        self,
        description: str = "Unauthorized",
        admin_only: bool = False,
        error: Optional[str] = None,
        error_description: Optional[str] = None,
    ) -> None:
        self.description = description
        self.www_auth_value = self.__get_www_auth_value(
            admin_only, error, error_description
        )
        Unauthorized.__init__(
            self, description=description, response=None, www_authenticate=None
        )

    def get_headers(
        self, 
        environ: Optional[Mapping[str, Any]] = None, 
        scope: Optional[Mapping[str, Any]] = None
    ) -> List[Tuple[str, str]]:
        return [("Content-Type", "text/html"), ("WWW-Authenticate", self.www_auth_value)]

    def __get_www_auth_value(
        self, admin_only: bool, error: Optional[str], error_description: Optional[str]
    ) -> str:
        realm = _REALM_ADMIN_USERS if admin_only else _REALM_REGULAR_USERS
        www_auth_value = f'Bearer realm="{realm}"'
        if error:
            www_auth_value += f', error="{error}"'
        if error_description:
            www_auth_value += f', error_description="{error_description}"'
        return www_auth_value


class ApiForbidden(Forbidden):
    """Raise status code 403 with WWW-Authenticate header."""

    description = "You are not an administrator"

    def get_headers(
        self, 
        environ: Optional[Mapping[str, Any]] = None, 
        scope: Optional[Mapping[str, Any]] = None
    ) -> List[Tuple[str, str]]:
        return [
            ("Content-Type", "text/html"),
            (
                "WWW-Authenticate",
                f'Bearer realm="{_REALM_ADMIN_USERS}", '
                'error="insufficient_scope", '
                'error_description="You are not an administrator"',
            ),
        ]