from http import HTTPStatus

from flask import url_for

from nausicass_global_green_initiative_api.models.application import Application
from nausicass_global_green_initiative_api.models.grant import Grant
from tests.util import (
    ADMIN_EMAIL,
    PASSWORD,
    DEFAULT_NAME,
    DEFAULT_DEADLINE,
    DEFAULT_DESCRIPTION,
    FORBIDDEN,
    register_user,
    login_user,
    create_grant,
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


def test_approve_application_as_admin(client, db, admin, user):
    """Test admin can approve an application."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)

    # Create application directly in DB to avoid login/logout cycles
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    # Admin approves the application (still logged in)
    response = client.put(
        url_for("api.application", application_id=application.id),
        json={"status": "approved"},
    )

    assert response.status_code == HTTPStatus.OK
    assert "status" in response.json
    assert response.json["status"] == "success"
    assert "message" in response.json

    # Verify application status was updated
    updated = Application.find_by_id(application.id)
    assert updated is not None
    assert updated.status == "approved"


def test_deny_application_with_feedback_as_admin(client, db, admin, user):
    """Test admin can deny an application with feedback."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)

    # Create application directly in DB to avoid login/logout cycles
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    # Admin denies the application with feedback (still logged in)
    feedback = "Application does not meet requirements"
    response = client.put(
        url_for("api.application", application_id=application.id),
        json={"status": "denied", "feedback": feedback},
    )

    assert response.status_code == HTTPStatus.OK
    assert "status" in response.json
    assert response.json["status"] == "success"

    # Verify application status and feedback were updated
    updated = Application.find_by_id(application.id)
    assert updated is not None
    assert updated.status == "denied"
    assert updated.feedback == feedback


def test_update_application_status_to_in_review(client, db, admin, user):
    """Test admin can update application status to in_review."""
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)

    # Create application directly in DB to avoid login/logout cycles
    application = _create_application_in_db(db, user, DEFAULT_NAME)

    # Admin updates the application to in_review (still logged in)
    response = client.put(
        url_for("api.application", application_id=application.id),
        json={"status": "in_review"},
    )

    assert response.status_code == HTTPStatus.OK

    # Verify application status was updated
    updated = Application.find_by_id(application.id)
    assert updated is not None
    assert updated.status == "in_review"


def test_update_application_unauthorized_user(client, db, admin):
    """Test non-admin user cannot update application status."""
    # Create a grant
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    client.post(url_for("api.auth_logout"))

    # Create a user and submit application
    register_user(client)
    login_user(client)
    application_response = client.post(
        url_for("api.application_list"),
        json={"grant_name": DEFAULT_NAME, "field_values": {}},
    )
    assert application_response.status_code == HTTPStatus.CREATED
    application_id = application_response.json["application_id"]

    # Regular user tries to update application status
    response = client.put(
        url_for("api.application", application_id=application_id),
        json={"status": "approved"},
    )

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "message" in response.json and response.json["message"] == FORBIDDEN


def test_update_application_invalid_status(client, db, admin):
    """Test updating application with invalid status value."""
    # Create a grant
    login_user(client, ADMIN_EMAIL, PASSWORD)
    create_grant(client, DEFAULT_NAME, DEFAULT_DEADLINE, DEFAULT_DESCRIPTION)
    client.post(url_for("api.auth_logout"))

    # Create a user and submit application
    register_user(client)
    login_user(client)
    application_response = client.post(
        url_for("api.application_list"),
        json={"grant_name": DEFAULT_NAME, "field_values": {}},
    )
    assert application_response.status_code == HTTPStatus.CREATED
    application_id = application_response.json["application_id"]
    client.post(url_for("api.auth_logout"))

    # Admin tries to update with invalid status
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
