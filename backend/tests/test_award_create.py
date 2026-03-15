from datetime import date, timedelta
from http import HTTPStatus

import pytest
from flask import url_for

from tests.util import (
    ADMIN_EMAIL,
    BAD_REQUEST,
    DEFAULT_NAME,
    EMAIL,
    FORBIDDEN,
    create_award,
    login_user,
    retrieve_award,
)


@pytest.mark.parametrize("award_name", ["abc123", "award-name", "new_award1"])
def test_create_award_valid_name(client, db, admin, award_name):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(client, award_name=award_name)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New award added: {award_name}."
    assert "message" in response.json and response.json["message"] == success
    assert "Location" in response.headers and response.headers["Location"] == url_for(
        "api.award", name=award_name, _external=True
    )


@pytest.mark.parametrize(
    "deadline_str",
    [
        date.today().strftime("%m/%d/%Y"),
        date.today().strftime("%Y-%m-%d"),
        (date.today() + timedelta(days=3)).strftime("%b %d %Y"),
    ],
)
def test_create_award_valid_deadline(client, db, admin, deadline_str):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(client, deadline_str=deadline_str)
    assert response.status_code == HTTPStatus.CREATED
    assert "status" in response.json and response.json["status"] == "success"
    success = f"New award added: {DEFAULT_NAME}."
    assert "message" in response.json and response.json["message"] == success
    assert "Location" in response.headers and response.headers["Location"] == url_for(
        "api.award", name=DEFAULT_NAME, _external=True
    )


@pytest.mark.parametrize(
    "deadline_str",
    [
        "1/1/1970",
        (date.today() - timedelta(days=3)).strftime("%Y-%m-%d"),
        "a long time ago, in a galaxy far, far away",
    ],
)
def test_create_award_invalid_deadline(client, db, admin, deadline_str):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(client, deadline_str=deadline_str)
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "message" in response.json and response.json["message"] == BAD_REQUEST
    assert "errors" in response.json and "deadline" in response.json["errors"]


def test_create_award_already_exists(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(client)
    assert response.status_code == HTTPStatus.CREATED
    response = create_award(client)
    assert response.status_code == HTTPStatus.CONFLICT
    name_conflict = f"Award name: {DEFAULT_NAME} already exists, must be unique."
    assert "message" in response.json and response.json["message"] == name_conflict


def test_create_award_no_admin_token(client, db, user):
    login_user(client, email=EMAIL)
    response = create_award(client)
    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN


def test_create_award_with_description(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_award(
        client,
        award_name="test-award",
        description="Test description",
    )
    assert response.status_code == HTTPStatus.CREATED

    # Verify fields are returned when retrieving the award
    response = retrieve_award(client, "test-award")
    assert response.status_code == HTTPStatus.OK
    assert response.json["description"] == "Test description"
