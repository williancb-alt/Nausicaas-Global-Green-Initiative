from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    EMAIL,
    DEFAULT_NAME,
    DEFAULT_DEADLINE,
    login_user,
    create_grant,
    retrieve_grant,
)


def test_retrieve_grant_non_admin_user(client, db, admin, user):
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = create_grant(client, access_token)
    assert response.status_code == HTTPStatus.CREATED

    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = retrieve_grant(client, access_token, grant_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.OK

    assert "name" in response.json and response.json["name"] == DEFAULT_NAME
    assert "deadline" in response.json and DEFAULT_DEADLINE in response.json["deadline"]
    assert "owner" in response.json and "email" in response.json["owner"]
    assert response.json["owner"]["email"] == ADMIN_EMAIL


def test_retrieve_grant_does_not_exist(client, db, user):
    response = login_user(client, email=EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]
    response = retrieve_grant(client, access_token, grant_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert (
        "message" in response.json
        and f"{DEFAULT_NAME} not found in database" in response.json["message"]
    )
