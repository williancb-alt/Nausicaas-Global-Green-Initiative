from datetime import date, timedelta
from http import HTTPStatus

from tests.util import ADMIN_EMAIL, login_user, create_grant, retrieve_grant_list


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
    response = login_user(client, email=ADMIN_EMAIL)
    assert "access_token" in response.json
    access_token = response.json["access_token"]

    # ADD SEVEN grant INSTANCES TO DATABASE
    for i in range(0, len(NAMES)):
        response = create_grant(
            client,
            access_token,
            grant_name=NAMES[i],
            deadline_str=DEADLINES[i],
        )
        assert response.status_code == HTTPStatus.CREATED

    response = retrieve_grant_list(client, access_token, page=1, per_page=5)
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

    response = retrieve_grant_list(client, access_token, page=2, per_page=5)
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

    response = retrieve_grant_list(client, access_token, page=1, per_page=10)
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

    response = retrieve_grant_list(client, access_token)
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
