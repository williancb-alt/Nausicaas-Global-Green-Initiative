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
    create_grant,
    login_user,
    retrieve_grant,
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


def test_create_grant_with_description(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)
    response = create_grant(
        client,
        grant_name="test-grant",
        description="Test description",
    )
    assert response.status_code == HTTPStatus.CREATED

    # Verify fields are returned when retrieving the grant
    response = retrieve_grant(client, "test-grant")
    assert response.status_code == HTTPStatus.OK
    assert response.json["description"] == "Test description"


def test_create_grant_with_custom_fields(client, db, admin):
    import json

    login_user(client, email=ADMIN_EMAIL)
    custom_fields = json.dumps(
        {
            "configs": [
                {"type": "text", "label": "Project Summary", "maxLength": 500},
                {"type": "radio", "label": "Category", "options": ["A", "B", "C"]},
            ],
            "values": {"field_0": "My summary", "field_1": "B"},
        }
    )
    response = create_grant(
        client, grant_name="custom-grant", custom_fields=custom_fields
    )
    assert response.status_code == HTTPStatus.CREATED

    # Verify custom fields are returned
    response = retrieve_grant(client, "custom-grant")
    assert response.status_code == HTTPStatus.OK
    assert response.json["custom_fields"] is not None
    assert len(response.json["custom_fields"]["configs"]) == 2


def test_create_grant_with_required_currency_field(client, db, admin):
    import json

    login_user(client, email=ADMIN_EMAIL)
    custom_fields = json.dumps(
        {
            "configs": [
                {
                    "type": "currency",
                    "label": "Funding Amount",
                    "min": 100,
                    "max": 50000,
                    "required": True,
                }
            ],
            "values": {},
        }
    )
    response = create_grant(
        client,
        grant_name="currency-grant",
        custom_fields=custom_fields,
    )
    assert response.status_code == HTTPStatus.CREATED

    response = retrieve_grant(client, "currency-grant")
    assert response.status_code == HTTPStatus.OK
    configs = response.json["custom_fields"]["configs"]
    assert len(configs) == 1
    assert configs[0]["type"] == "currency"
    assert configs[0]["label"] == "Funding Amount"
    assert configs[0]["min"] == 100
    assert configs[0]["max"] == 50000
    assert configs[0]["required"] is True


def test_create_grant_with_optional_and_required_fields(client, db, admin):
    import json

    login_user(client, email=ADMIN_EMAIL)
    custom_fields = json.dumps(
        {
            "configs": [
                {
                    "type": "text",
                    "label": "Project Summary",
                    "maxLength": 500,
                    "required": True,
                },
                {
                    "type": "currency",
                    "label": "Budget",
                    "min": 0,
                    "max": 100000,
                    "required": False,
                },
            ],
            "values": {},
        }
    )
    response = create_grant(
        client,
        grant_name="mixed-fields-grant",
        custom_fields=custom_fields,
    )
    assert response.status_code == HTTPStatus.CREATED

    response = retrieve_grant(client, "mixed-fields-grant")
    assert response.status_code == HTTPStatus.OK
    configs = response.json["custom_fields"]["configs"]
    assert len(configs) == 2
    assert configs[0]["required"] is True
    assert configs[1]["required"] is False
