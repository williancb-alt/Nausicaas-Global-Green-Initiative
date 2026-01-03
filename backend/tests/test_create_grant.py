from datetime import date, timedelta
from http import HTTPStatus
from flask import url_for

import pytest
from tests.util import (
    EMAIL,
    ADMIN_EMAIL,
    DEFAULT_NAME,
    BAD_REQUEST,
    FORBIDDEN,
    login_user,
    create_grant,
)


@pytest.mark.parametrize("grant_name", ["abc123", "grant-name", "new_grant1"])
def test_create_grant_valid_name(client, db, admin, grant_name):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client, grant_name=grant_name)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New grant added: {grant_name}."
    assert "message" in response.json and response.json["message"] == success
    assert "Location" in response.headers and response.headers["Location"] == url_for(
        "api.grant", name=grant_name, _external=True
    )


@pytest.mark.parametrize(
    "deadline_str",
    [
        date.today().strftime("%m/%d/%Y"),
        date.today().strftime("%Y-%m-%d"),
        (date.today() + timedelta(days=3)).strftime("%b %d %Y"),
    ],
)
def test_create_grant_valid_deadline(client, db, admin, deadline_str):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client, deadline_str=deadline_str)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New grant added: {DEFAULT_NAME}."
    assert "message" in response.json and response.json["message"] == success
    assert "Location" in response.headers and response.headers["Location"] == url_for(
        "api.grant", name=DEFAULT_NAME, _external=True
    )


@pytest.mark.parametrize(
    "deadline_str",
    [
        "1/1/1970",
        (date.today() - timedelta(days=3)).strftime("%Y-%m-%d"),
        "a long time ago, in a galaxy far, far away",
    ],
)
def test_create_grant_invalid_deadline(client, db, admin, deadline_str):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client, deadline_str=deadline_str)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "deadline" in response.json["errors"]


def test_create_grant_already_exists(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(client)
    assert response.status_code == HTTPStatus.CREATED
    response = create_grant(client)
    assert response.status_code == HTTPStatus.CONFLICT
    name_conflict = f"Grant name: {DEFAULT_NAME} already exists, must be unique."
    assert "message" in response.json and response.json["message"] == name_conflict


def test_create_grant_no_admin_token(client, db, user):
    login_user(client, email=EMAIL)
    response = create_grant(client)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN
