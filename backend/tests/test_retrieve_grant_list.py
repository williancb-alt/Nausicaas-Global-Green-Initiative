from datetime import date, timedelta
from http import HTTPStatus

from flask import url_for

from tests.util import (
    ADMIN_EMAIL,
    EMAIL,
    PASSWORD,
    create_grant,
    login_user,
    register_user,
    retrieve_grant_list,
)

NAMES = [
    "grant1",
    "second_grant",
    "grant-thrice",
    "tetraWIDG",
    "PENTA-widg-GON-et",
    "hexa_grant",
    "sep7",
]

URLS = [
    "http://www.one.com",
    "https://www.two.net",
    "https://www.three.edu",
    "http://www.four.dev",
    "http://www.five.io",
    "https://www.six.tech",
    "https://www.seven.dot",
]

DEADLINES = [
    date.today().strftime("%m/%d/%y"),
    (date.today() + timedelta(days=3)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=5)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=10)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=17)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=23)).strftime("%m/%d/%y"),
    (date.today() + timedelta(days=78)).strftime("%m/%d/%y"),
]


def test_retrieve_paginated_grant_list(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)

    for i in range(0, len(NAMES)):
        response = create_grant(
            client,
            grant_name=NAMES[i],
            deadline_str=DEADLINES[i],
        )
        assert response.status_code == HTTPStatus.CREATED

    response = retrieve_grant_list(client, page=1, per_page=5)
    assert response.status_code == HTTPStatus.OK

    assert "has_prev" in response.json and not response.json["has_prev"]
    assert "has_next" in response.json and response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 1
    assert "total_pages" in response.json and response.json["total_pages"] == 2
    assert "items_per_page" in response.json and response.json["items_per_page"] == 5
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 5

    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

    response = retrieve_grant_list(client, page=2, per_page=5)
    assert response.status_code == HTTPStatus.OK

    assert "has_prev" in response.json and response.json["has_prev"]
    assert "has_next" in response.json and not response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 2
    assert "total_pages" in response.json and response.json["total_pages"] == 2
    assert "items_per_page" in response.json and response.json["items_per_page"] == 5
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 2

    for i in range(5, response.json["total_items"]):
        item = response.json["items"][i - 5]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

    response = retrieve_grant_list(client, page=1, per_page=10)
    assert response.status_code == HTTPStatus.OK

    assert "has_prev" in response.json and not response.json["has_prev"]
    assert "has_next" in response.json and not response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 1
    assert "total_pages" in response.json and response.json["total_pages"] == 1
    assert "items_per_page" in response.json and response.json["items_per_page"] == 10
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 7

    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL

    response = retrieve_grant_list(client)
    assert response.status_code == HTTPStatus.OK

    assert "has_prev" in response.json and not response.json["has_prev"]
    assert "has_next" in response.json and not response.json["has_next"]
    assert "page" in response.json and response.json["page"] == 1
    assert "total_pages" in response.json and response.json["total_pages"] == 1
    assert "items_per_page" in response.json and response.json["items_per_page"] == 10
    assert "total_items" in response.json and response.json["total_items"] == 7
    assert "items" in response.json and len(response.json["items"]) == 7

    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL


def test_hidden_grants_not_visible_to_non_admin(client, db, admin):
    """Test that hidden grants are not returned to non-admin users."""
    # Admin creates visible and hidden grants
    login_user(client, email=ADMIN_EMAIL, password=PASSWORD)
    create_grant(client, grant_name="visible-grant")

    # Create hidden grant
    client.post(
        url_for("api.grant_list"),
        data=f"name=hidden-grant&deadline={DEADLINES[0]}&description=Test&hidden=true",
        content_type="application/x-www-form-urlencoded",
    )
    client.post(url_for("api.auth_logout"))

    # Regular user fetches grants
    register_user(client)
    login_user(client, email=EMAIL, password=PASSWORD)
    response = retrieve_grant_list(client)

    assert response.status_code == HTTPStatus.OK
    assert "items" in response.json
    assert len(response.json["items"]) == 1
    assert response.json["items"][0]["name"] == "visible-grant"


def test_hidden_grants_visible_to_admin(client, db, admin):
    """Test that hidden grants are visible to admin users."""
    # Admin creates visible and hidden grants
    login_user(client, email=ADMIN_EMAIL, password=PASSWORD)
    create_grant(client, grant_name="visible-grant")

    client.post(
        url_for("api.grant_list"),
        data=f"name=hidden-grant&deadline={DEADLINES[0]}&description=Test&hidden=true",
        content_type="application/x-www-form-urlencoded",
    )

    # Admin fetches grants
    response = retrieve_grant_list(client)

    assert response.status_code == HTTPStatus.OK
    assert "items" in response.json
    assert len(response.json["items"]) == 2
    grant_names = [item["name"] for item in response.json["items"]]
    assert "visible-grant" in grant_names
    assert "hidden-grant" in grant_names


def test_toggle_grant_visibility(client, db, admin):
    """Test toggling grant from visible to hidden."""
    # Create visible grant
    login_user(client, email=ADMIN_EMAIL, password=PASSWORD)
    create_grant(client, grant_name="test-grant")

    # Verify it's visible
    response = retrieve_grant_list(client)
    assert len(response.json["items"]) == 1

    # Toggle to hidden
    client.put(
        url_for("api.grant", name="test-grant"),
        data=f"deadline={DEADLINES[0]}&description=Test&hidden=true",
        content_type="application/x-www-form-urlencoded",
    )
    client.post(url_for("api.auth_logout"))

    # Verify non-admin can't see it
    register_user(client)
    login_user(client, email=EMAIL, password=PASSWORD)
    response = retrieve_grant_list(client)
    assert len(response.json["items"]) == 0


def test_create_grant_with_hidden_flag(client, db, admin):
    """Test creating a grant with hidden=True."""
    login_user(client, email=ADMIN_EMAIL, password=PASSWORD)

    dl = DEADLINES[0]
    grant_data = f"name=new-hidden-grant&deadline={dl}&description=Test&hidden=true"
    response = client.post(
        url_for("api.grant_list"),
        data=grant_data,
        content_type="application/x-www-form-urlencoded",
    )

    assert response.status_code == HTTPStatus.CREATED

    # Fetch the created grant to verify hidden flag
    grant_response = client.get(url_for("api.grant", name="new-hidden-grant"))
    assert grant_response.status_code == HTTPStatus.OK
    assert "hidden" in grant_response.json
    assert grant_response.json["hidden"] is True
