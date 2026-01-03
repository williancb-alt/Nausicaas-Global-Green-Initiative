from datetime import date
from typing import Optional

from flask import Response, url_for
from flask.testing import FlaskClient

EMAIL = "new_user@email.com"
ADMIN_EMAIL = "admin_user@email.com"
PASSWORD = "test1234"
BAD_REQUEST = "Input payload validation failed"
UNAUTHORIZED = "Unauthorized"
FORBIDDEN = "You are not an administrator"
WWW_AUTH_NO_TOKEN = 'Bearer realm="registered_users@mydomain.com"'
DEFAULT_NAME = "some-grant"
DEFAULT_URL = "https://www.fakesite.com"
DEFAULT_DEADLINE = date.today().strftime("%m/%d/%y")


def register_user(
    test_client: FlaskClient, email: str = EMAIL, password: str = PASSWORD
) -> Response:
    return test_client.post(
        url_for("api.auth_register"),
        data=f"email={email}&password={password}",
        content_type="application/x-www-form-urlencoded",
    )


def login_user(
    test_client: FlaskClient, email: str = EMAIL, password: str = PASSWORD
) -> Response:
    return test_client.post(
        url_for("api.auth_login"),
        data=f"email={email}&password={password}",
        content_type="application/x-www-form-urlencoded",
    )


def get_user(test_client: FlaskClient, access_token: str) -> Response:
    return test_client.get(
        url_for("api.auth_user"), headers={"Authorization": f"Bearer {access_token}"}
    )


def logout_user(test_client: FlaskClient, access_token: str) -> Response:
    return test_client.post(
        url_for("api.auth_logout"), headers={"Authorization": f"Bearer {access_token}"}
    )


def create_grant(
    test_client: FlaskClient,
    access_token: str,
    grant_name: str = DEFAULT_NAME,
    deadline_str: str = DEFAULT_DEADLINE,
) -> Response:
    return test_client.post(
        url_for("api.grant_list"),
        headers={"Authorization": f"Bearer {access_token}"},
        data=f"name={grant_name}&deadline={deadline_str}",
        content_type="application/x-www-form-urlencoded",
    )


def retrieve_grant_list(
    test_client: FlaskClient,
    access_token: str,
    page: Optional[int] = None,
    per_page: Optional[int] = None,
) -> Response:
    return test_client.get(
        url_for("api.grant_list", page=page, per_page=per_page),
        headers={"Authorization": f"Bearer {access_token}"},
    )


def retrieve_grant(test_client: FlaskClient, access_token: str, grant_name: str) -> Response:
    return test_client.get(
        url_for("api.grant", name=grant_name),
        headers={"Authorization": f"Bearer {access_token}"},
    )


def update_grant(
    test_client: FlaskClient, access_token: str, grant_name: str, deadline_str: str
) -> Response:
    return test_client.put(
        url_for("api.grant", name=grant_name),
        headers={"Authorization": f"Bearer {access_token}"},
        data=f"deadline={deadline_str}",
        content_type="application/x-www-form-urlencoded",
    )


def delete_grant(test_client: FlaskClient, access_token: str, grant_name: str) -> Response:
    return test_client.delete(
        url_for("api.grant", name=grant_name),
        headers={"Authorization": f"Bearer {access_token}"},
    )
