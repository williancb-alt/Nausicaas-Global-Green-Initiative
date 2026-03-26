from http import HTTPStatus

import pytest
from flask import url_for

from nausicass_global_green_initiative_api.models.application import (
    Application,
)
from nausicass_global_green_initiative_api.models.audit_log import AuditLog, AuditAction
from nausicass_global_green_initiative_api.models.award import Award
from nausicass_global_green_initiative_api.models.grant import Grant
from tests.util import (
    ADMIN_EMAIL,
    DEFAULT_DEADLINE,
    DEFAULT_DESCRIPTION,
    DEFAULT_NAME,
    FORBIDDEN,
    PASSWORD,
    create_grant,
    create_award,
    login_user,
    register_user,
)


def _create_application_in_db(db, user, grant_name):
    """Create an application directly in the DB to avoid login cycles."""
    grant = Grant.find_by_name(grant_name)
    application = Application(
        user_id=user.id,
        grant_id=grant.id,
        field_values={},
        status="pending_review",
    )
    db.session.add(application)
    db.session.commit()
    return application


def _create_user_application_via_api(
    client,
    *,
    award_name: str | None = None,
    award_justification: str | None = None,
) -> int:
    register_user(client)
    login_user(client)
    payload = {"grant_name": DEFAULT_NAME, "field_values": {}}
    if award_name is not None:
        payload["award_name"] = award_name
    if award_justification is not None:
        payload["award_justification"] = award_justification
    resp = client.post(
        url_for("api.application_list"),
        json=payload,
    )
    assert resp.status_code == HTTPStatus.CREATED
    return resp.json["application_id"]


def _prepare_user_application_submission(
    client, *, create_default_award: bool = False
) -> None:
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    if create_default_award:
        create_award(client, "test-award", DEFAULT_DEADLINE, "Award description")
    client.post(url_for("api.auth_logout"))
    register_user(client)
    login_user(client)


def _submit_application(client, payload: dict[str, object]):
    return client.post(
        url_for("api.application_list"),
        json={"grant_name": DEFAULT_NAME, "field_values": {}} | payload,
    )


@pytest.mark.usefixtures("admin")
@pytest.mark.parametrize(
    "case",
    [
        {
            "payload": {"status": "approved"},
            "expected_status": "approved",
            "expected_feedback": None,
        },
        {
            "payload": {
                "status": "denied",
                "feedback": "Application does not meet requirements",
            },
            "expected_status": "denied",
            "expected_feedback": "Application does not meet requirements",
        },
        {
            "payload": {"status": "in_review"},
            "expected_status": "in_review",
            "expected_feedback": None,
        },
    ],
)
def test_admin_updates_application_status(client, db, user, case):
    payload = case["payload"]
    expected_status = case["expected_status"]
    expected_feedback = case["expected_feedback"]
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    response = client.put(
        url_for("api.application", application_id=application.id),
        json=payload,
    )
    assert response.status_code == HTTPStatus.OK

    updated = Application.find_by_id(application.id)
    assert updated is not None
    assert updated.status == expected_status
    if expected_feedback is not None:
        assert updated.feedback == expected_feedback


@pytest.mark.usefixtures("admin")
def test_user_submits_application_with_award_selection(client, db):
    _prepare_user_application_submission(client, create_default_award=True)

    application_id = _create_user_application_via_api(
        client,
        award_name="test-award",
        award_justification="My project directly advances the award goals.",
    )

    application = Application.find_by_id(application_id)
    assert application is not None
    assert application.award is not None
    assert application.award.name == "test-award"
    assert (
        application.award_justification
        == "My project directly advances the award goals."
    )


@pytest.mark.usefixtures("admin")
@pytest.mark.parametrize(
    "case",
    [
        {
            "create_default_award": False,
            "payload": {
                "award_name": "missing-award",
                "award_justification": "I should be considered.",
            },
            "expected_status": HTTPStatus.NOT_FOUND,
            "expected_message": "Award 'missing-award' not found.",
        },
        {
            "create_default_award": True,
            "payload": {
                "award_name": "test-award",
                "award_justification": "   ",
            },
            "expected_status": HTTPStatus.BAD_REQUEST,
            "expected_message": (
                "Award justification is required when an award is selected."
            ),
        },
        {
            "create_default_award": False,
            "payload": {"award_justification": "I should be considered."},
            "expected_status": HTTPStatus.BAD_REQUEST,
            "expected_message": (
                "Award justification cannot be provided without selecting " "an award."
            ),
        },
    ],
)
def test_user_application_submission_award_validation(client, case):
    _prepare_user_application_submission(
        client, create_default_award=case["create_default_award"]
    )

    response = _submit_application(client, case["payload"])

    assert response.status_code == case["expected_status"]
    assert response.json["message"] == case["expected_message"]


@pytest.mark.usefixtures("admin")
def test_admin_links_award_to_application(client, db, user):
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    create_award(client, "test-award", DEFAULT_DEADLINE, "Award description")
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    response = client.put(
        url_for("api.application", application_id=application.id),
        json={
            "status": "approved",
            "award_name": "test-award",
            "award_justification": "Best match for the evaluation criteria.",
        },
    )
    assert response.status_code == HTTPStatus.OK

    updated = Application.find_by_id(application.id)
    assert updated is not None
    assert updated.award is not None
    assert updated.award.name == "test-award"
    assert updated.award_justification == "Best match for the evaluation criteria."

    response = client.get(url_for("api.application", application_id=application.id))
    assert response.status_code == HTTPStatus.OK
    assert response.json["award"]["name"] == "test-award"
    assert response.json["award"]["description"] == "Award description"
    assert (
        response.json["award_justification"] == "Best match for the evaluation criteria."
    )


@pytest.mark.usefixtures("admin")
def test_admin_clears_linked_award_from_application(client, db, user):
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    create_award(client, "test-award", DEFAULT_DEADLINE, "Award description")
    application = _create_application_in_db(db, user, DEFAULT_NAME)
    application.award = Award.find_by_name("test-award")
    application.award_justification = "Initial justification"
    db.session.commit()

    response = client.put(
        url_for("api.application", application_id=application.id),
        json={"award_name": None, "award_justification": None},
    )
    assert response.status_code == HTTPStatus.OK

    updated = Application.find_by_id(application.id)
    assert updated is not None
    assert updated.award is None
    assert updated.award_justification is None


@pytest.mark.usefixtures("admin")
def test_admin_cannot_link_unknown_award_to_application(client, db, user):
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    response = client.put(
        url_for("api.application", application_id=application.id),
        json={"award_name": "missing-award"},
    )

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json["message"] == "Award 'missing-award' not found."


def _setup_non_admin_with_application(client) -> int:
    """Create a grant as admin, then submit an application as a regular user.

    Returns the application ID.
    """
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    client.post(url_for("api.auth_logout"))
    register_user(client)
    login_user(client)
    application_response = client.post(
        url_for("api.application_list"),
        json={"grant_name": DEFAULT_NAME, "field_values": {}},
    )
    assert application_response.status_code == HTTPStatus.CREATED
    return application_response.json["application_id"]


def test_update_application_unauthorized_user(client, db, admin):
    """Test non-admin user cannot update application status."""
    application_id = _setup_non_admin_with_application(client)

    response = client.put(
        url_for("api.application", application_id=application_id),
        json={"status": "approved"},
    )

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN


@pytest.mark.usefixtures("admin")
def test_update_application_invalid_status(client):
    """Test updating application with invalid status value."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    client.post(url_for("api.auth_logout"))

    application_id = _create_user_application_via_api(client)

    client.post(url_for("api.auth_logout"))
    login_user(client, ADMIN_EMAIL, PASSWORD)

    response = client.put(
        url_for("api.application", application_id=application_id),
        json={"status": "invalid_status"},
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_update_application_not_found(client, db, admin):
    """Test updating a non-existent application."""
    login_user(client, ADMIN_EMAIL, PASSWORD)

    response = client.put(
        url_for("api.application", application_id=99999),
        data="status=approved",
        content_type="application/x-www-form-urlencoded",
    )

    assert response.status_code == HTTPStatus.NOT_FOUND


def test_retrieve_all_applications_as_admin(client, db, admin, user):
    """Test admin can retrieve all applications."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)

    # Create application directly in DB to avoid login/logout cycles
    _create_application_in_db(db, user, DEFAULT_NAME)

    # Admin retrieves all applications (still logged in)
    response = client.get(url_for("api.application_list"))

    assert response.status_code == HTTPStatus.OK
    assert "items" in response.json
    assert len(response.json["items"]) == 1


def test_retrieve_all_applications_unauthorized(client, db):
    """Test non-admin user cannot retrieve all applications."""
    register_user(client)
    login_user(client)

    response = client.get(url_for("api.application_list"))

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN


def test_non_admin_cannot_delete_application(client, db, admin):
    """Test that a regular user cannot delete an application."""
    application_id = _setup_non_admin_with_application(client)

    response = client.delete(
        url_for("api.application", application_id=application_id)
    )

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN


def test_audit_log_records_blocked_edit_attempt(client, db, admin):
    """Test that a blocked non-admin PUT attempt creates an audit log entry."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    client.post(url_for("api.auth_logout"))

    register_user(client)
    login_user(client)
    application_response = client.post(
        url_for("api.application_list"),
        json={"grant_name": DEFAULT_NAME, "field_values": {}},
    )
    assert application_response.status_code == HTTPStatus.CREATED
    application_id = application_response.json["application_id"]

    client.put(
        url_for("api.application", application_id=application_id),
        json={"status": "approved"},
    )

    log = (
        AuditLog.query.filter_by(
            entity_type="application",
            entity_id=application_id,
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
        )
        .order_by(AuditLog.timestamp.desc())
        .first()
    )
    assert log is not None
    assert log.success is False
    assert log.is_admin is False


def test_audit_log_records_admin_edit(client, db, user, admin):
    """Test that a successful admin PUT creates an audit log entry."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    client.put(
        url_for("api.application", application_id=application.id),
        json={"status": "in_review"},
    )

    log = (
        AuditLog.query.filter_by(
            entity_type="application",
            entity_id=application.id,
            action=AuditAction.APPLICATION_EDITED.value,
        )
        .order_by(AuditLog.timestamp.desc())
        .first()
    )
    assert log is not None
    assert log.success is True
    assert log.is_admin is True
