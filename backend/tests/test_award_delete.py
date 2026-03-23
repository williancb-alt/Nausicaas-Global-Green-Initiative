from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    DEFAULT_NAME,
    EMAIL,
    FORBIDDEN,
    create_award,
    delete_award,
    login_user,
    retrieve_award,
)


def test_delete_award(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(client)
    assert response.status_code == HTTPStatus.CREATED
    response = delete_award(client, award_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NO_CONTENT
    response = retrieve_award(client, award_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_delete_award_no_admin_token(client, db, admin, user):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(client)
    assert response.status_code == HTTPStatus.CREATED

    login_user(client, email=EMAIL)
    response = delete_award(client, award_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN
