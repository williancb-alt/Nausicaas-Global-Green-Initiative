from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    DEFAULT_NAME,
    EMAIL,
    FORBIDDEN,
    create_grant,
    delete_grant,
    login_user,
    retrieve_grant,
)


def test_delete_grant(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client)
    assert response.status_code == HTTPStatus.CREATED
    response = delete_grant(client, grant_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NO_CONTENT
    response = retrieve_grant(client, grant_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_delete_grant_no_admin_token(client, db, admin, user):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client)
    assert response.status_code == HTTPStatus.CREATED

    login_user(client, email=EMAIL)
    response = delete_grant(client, grant_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN
