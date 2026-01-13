from datetime import date, timedelta
from http import HTTPStatus

from tests.util import (
    ADMIN_EMAIL,
    DEFAULT_NAME,
    login_user,
    create_grant,
    retrieve_grant,
    update_grant,
)

UPDATED_DEADLINE = (date.today() + timedelta(days=5)).strftime("%m/%d/%y")


def test_update_grant(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client)
    assert response.status_code == HTTPStatus.CREATED

    response = update_grant(
        client,
        grant_name=DEFAULT_NAME,
        deadline_str=UPDATED_DEADLINE,
    )
    assert response.status_code == HTTPStatus.OK
    response = retrieve_grant(client, grant_name=DEFAULT_NAME)
    assert response.status_code == HTTPStatus.OK

    assert "name" in response.json and response.json["name"] == DEFAULT_NAME
    assert "deadline" in response.json and UPDATED_DEADLINE in response.json["deadline"]
    assert "owner" in response.json and "email" in response.json["owner"]
    assert response.json["owner"]["email"] == ADMIN_EMAIL
