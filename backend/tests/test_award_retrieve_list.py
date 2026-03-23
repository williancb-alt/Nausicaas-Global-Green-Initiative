from datetime import date, timedelta
from http import HTTPStatus

from tests.util import ADMIN_EMAIL, create_award, login_user, retrieve_award_list

NAMES = [
    "award1",
    "second_award",
    "award-thrice",
    "tetraWIDG",
    "PENTA-widg-GON-et",
    "hexa_award",
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


def _create_awards(client):
    for i in range(0, len(NAMES)):
        response = create_award(
            client,
            award_name=NAMES[i],
            deadline_str=DEADLINES[i],
        )
        assert response.status_code == HTTPStatus.CREATED


def _assert_paginated_response(
    response,
    expected,
):
    data = response.json
    assert "has_prev" in data and data["has_prev"] == expected["has_prev"]
    assert "has_next" in data and data["has_next"] == expected["has_next"]
    assert "page" in data and data["page"] == expected["page"]
    assert "total_pages" in data and data["total_pages"] == expected["total_pages"]
    assert (
        "items_per_page" in data and data["items_per_page"] == expected["items_per_page"]
    )
    assert "total_items" in data and data["total_items"] == expected["total_items"]
    assert "items" in data and len(data["items"]) == expected["items_len"]


def test_retrieve_paginated_award_list(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)

    _create_awards(client)

    response = retrieve_award_list(client, page=1, per_page=5)
    assert response.status_code == HTTPStatus.OK

    _assert_paginated_response(
        response,
        expected={
            "has_prev": False,
            "has_next": True,
            "page": 1,
            "total_pages": 2,
            "items_per_page": 5,
            "total_items": 7,
            "items_len": 5,
        },
    )

    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL


def test_retrieve_paginated_award_list_pagination_page_2(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)

    _create_awards(client)

    response = retrieve_award_list(client, page=2, per_page=5)
    assert response.status_code == HTTPStatus.OK

    _assert_paginated_response(
        response,
        expected={
            "has_prev": True,
            "has_next": False,
            "page": 2,
            "total_pages": 2,
            "items_per_page": 5,
            "total_items": 7,
            "items_len": 2,
        },
    )

    for i in range(5, response.json["total_items"]):
        item = response.json["items"][i - 5]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL


def test_retrieve_paginated_award_list_pagination_page_1(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)

    _create_awards(client)

    response = retrieve_award_list(client, page=1, per_page=10)
    assert response.status_code == HTTPStatus.OK

    _assert_paginated_response(
        response,
        expected={
            "has_prev": False,
            "has_next": False,
            "page": 1,
            "total_pages": 1,
            "items_per_page": 10,
            "total_items": 7,
            "items_len": 7,
        },
    )

    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL


def test_retrieve_paginated_award_list_no_pagination(client, db, admin):
    login_user(client, email=ADMIN_EMAIL)

    _create_awards(client)

    response = retrieve_award_list(client)
    assert response.status_code == HTTPStatus.OK

    _assert_paginated_response(
        response,
        expected={
            "has_prev": False,
            "has_next": False,
            "page": 1,
            "total_pages": 1,
            "items_per_page": 10,
            "total_items": 7,
            "items_len": 7,
        },
    )

    for i in range(0, len(response.json["items"])):
        item = response.json["items"][i]
        assert "name" in item and item["name"] == NAMES[i]
        assert "deadline" in item and DEADLINES[i] in item["deadline"]
        assert "owner" in item and "email" in item["owner"]
        assert item["owner"]["email"] == ADMIN_EMAIL
