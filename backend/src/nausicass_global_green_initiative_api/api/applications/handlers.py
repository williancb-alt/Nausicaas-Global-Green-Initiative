from http import HTTPStatus
from typing import TypedDict

from flask import Response, current_app, jsonify, render_template, url_for
from flask_restx import abort, marshal
from flask_sqlalchemy.pagination import Pagination

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.api.applications.dto import (
    application_pagination_model,
)
from nausicass_global_green_initiative_api.api.auth.decorators import (
    admin_token_required,
    token_required,
)
from nausicass_global_green_initiative_api.models.award import Award
from nausicass_global_green_initiative_api.models.application import Application
from nausicass_global_green_initiative_api.models.grant import Grant
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.email_service import EmailService


class ApplicationCreateDict(TypedDict, total=False):
    """Type definition for creating applications."""

    grant_name: str
    field_values: dict | None
    award_name: str | None
    award_justification: str | None


class ApplicationUpdateDict(TypedDict, total=False):
    """Type definition for updating applications."""

    status: str | None
    feedback: str | None
    award_name: str | None
    award_justification: str | None
    field_values: dict | None


@token_required
def create_application(application_dict: ApplicationCreateDict) -> Response:
    """Create a new application for a grant."""
    grant_name = application_dict["grant_name"]
    field_values = application_dict.get("field_values")
    award_name = application_dict.get("award_name")
    award_justification = application_dict.get("award_justification")

    # Find the grant
    grant = Grant.find_by_name(grant_name)
    if not grant:
        abort(HTTPStatus.NOT_FOUND, f"Grant '{grant_name}' not found.", status="fail")

    # Check if grant deadline has passed
    if grant.deadline_passed:
        abort(
            HTTPStatus.BAD_REQUEST,
            f"Cannot apply to '{grant_name}' - deadline has passed.",
            status="fail",
        )

    # Get current user
    public_id = create_application.public_id  # type: ignore[attr-defined]
    user = User.find_by_public_id(public_id)
    if not user:
        abort(HTTPStatus.UNAUTHORIZED, "User not found.", status="fail")

    # Check if user is admin
    if user.admin:
        abort(
            HTTPStatus.FORBIDDEN,
            "Administrators cannot apply for grants.",
            status="fail",
        )

    # Check if user already applied to this grant
    existing = Application.find_by_user_and_grant(user.id, grant.id)
    if existing:
        abort(
            HTTPStatus.CONFLICT,
            f"You have already applied to '{grant_name}'.",
            status="fail",
        )

    award = _get_optional_award(award_name)
    _validate_award_justification(award_name, award_justification)

    # Create application
    application = Application(
        user_id=user.id,
        grant_id=grant.id,
        award=award,
        award_justification=award_justification,
        field_values=field_values,
        status="pending_review",
    )

    db.session.add(application)
    db.session.commit()

    response = jsonify(
        status="success",
        message=f"Application submitted for '{grant_name}'.",
        application_id=application.id,
    )
    response.status_code = HTTPStatus.CREATED
    response.headers["Location"] = url_for(
        "api.application", application_id=application.id, _external=True
    )
    return response


@token_required
def retrieve_my_applications(page: int, per_page: int) -> Response:
    """Retrieve applications for the current user."""
    public_id = retrieve_my_applications.public_id  # type: ignore[attr-defined]
    user = User.find_by_public_id(public_id)
    if not user:
        abort(HTTPStatus.UNAUTHORIZED, "User not found.", status="fail")

    pagination = Application.query.filter_by(user_id=user.id).paginate(
        page=page, per_page=per_page, error_out=False
    )

    response_data = marshal(pagination, application_pagination_model)
    response_data["links"] = _pagination_nav_links(pagination, "api.my_applications")
    response = jsonify(response_data)
    response.headers["Link"] = _pagination_nav_header_links(
        pagination, "api.my_applications"
    )
    response.headers["Total-Count"] = pagination.total
    return response


@admin_token_required
def retrieve_all_applications(page: int, per_page: int) -> Response:
    """Retrieve all applications (admin only)."""
    pagination = Application.query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    response_data = marshal(pagination, application_pagination_model)
    response_data["links"] = _pagination_nav_links(pagination, "api.application_list")
    response = jsonify(response_data)
    response.headers["Link"] = _pagination_nav_header_links(
        pagination, "api.application_list"
    )
    response.headers["Total-Count"] = pagination.total
    return response


@token_required
def retrieve_application(application_id: int) -> Application:
    """Retrieve a specific application."""
    application = Application.query.filter_by(id=application_id).first_or_404(
        description=f"Application {application_id} not found."
    )

    # Check if user is admin or the owner of the application
    public_id = retrieve_application.public_id  # type: ignore[attr-defined]
    user = User.find_by_public_id(public_id)
    if not user:
        abort(HTTPStatus.UNAUTHORIZED, "User not found.", status="fail")

    if not user.admin and application.user_id != user.id:
        abort(
            HTTPStatus.FORBIDDEN,
            "You do not have permission to view this application.",
            status="fail",
        )

    return application


@admin_token_required
def update_application(
    application_id: int, application_dict: ApplicationUpdateDict
) -> Response:
    """Update application status/feedback (admin only)."""
    application = Application.query.filter_by(id=application_id).first_or_404(
        description=f"Application {application_id} not found."
    )

    status_changed = False
    new_status = application_dict.get("status")

    if new_status:
        status_changed = application.status != new_status
        application.status = new_status

    _apply_application_updates(application, application_dict)

    db.session.commit()

    if status_changed:
        _send_status_update_email(application)

    response = jsonify(
        status="success",
        message=f"Application {application_id} updated.",
    )
    response.status_code = HTTPStatus.OK
    return response


def _send_status_update_email(application: Application) -> None:
    """Send an email notification when an application status changes."""
    try:
        user = application.user
        grant_name = application.grant.name
        new_status = application.status
        feedback = application.feedback

        subject = f"[APPLICATION UPDATE] {grant_name}"
        html_body = render_template(
            "email/application_status_update.html",
            grant_name=grant_name,
            new_status=new_status,
            feedback=feedback,
        )

        EmailService.send_email(
            to=[user.email],
            subject=subject,
            html_body=html_body,
        )
    except Exception as e:
        current_app.logger.warning(
            f"Failed to send update email for application {application.id}: {e}"
        )


@admin_token_required
def delete_application(application_id: int) -> tuple[str, HTTPStatus]:
    """Delete an application (admin only)."""
    application = Application.query.filter_by(id=application_id).first_or_404(
        description=f"Application {application_id} not found."
    )

    db.session.delete(application)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT


def _apply_application_updates(
    application: Application, application_dict: ApplicationUpdateDict
) -> None:
    if application_dict.get("feedback") is not None:
        application.feedback = application_dict["feedback"]
    if "field_values" in application_dict:
        application.field_values = application_dict["field_values"]

    _apply_award_updates(application, application_dict)


def _apply_award_updates(
    application: Application, application_dict: ApplicationUpdateDict
) -> None:
    if "award_name" in application_dict:
        _set_application_award(application, application_dict)
    if "award_justification" in application_dict:
        application.award_justification = application_dict["award_justification"]

    _validate_award_justification(
        application.award.name if application.award else None,
        application.award_justification,
    )


def _set_application_award(
    application: Application, application_dict: ApplicationUpdateDict
) -> None:
    award_name = application_dict["award_name"]
    if award_name is None:
        application.award = None
        if "award_justification" not in application_dict:
            application.award_justification = None
        return

    application.award = _get_optional_award(award_name)


def _get_optional_award(award_name: str | None) -> Award | None:
    if award_name is None:
        return None

    award = Award.find_by_name(award_name)
    if not award:
        abort(
            HTTPStatus.NOT_FOUND,
            f"Award '{award_name}' not found.",
            status="fail",
        )
    return award


def _validate_award_justification(
    award_name: str | None, award_justification: str | None
) -> None:
    has_justification = (
        award_justification is not None and award_justification.strip() != ""
    )
    if award_name and not has_justification:
        abort(
            HTTPStatus.BAD_REQUEST,
            "Award justification is required when an award is selected.",
            status="fail",
        )
    if not award_name and has_justification:
        abort(
            HTTPStatus.BAD_REQUEST,
            "Award justification cannot be provided without selecting an award.",
            status="fail",
        )


def _pagination_nav_links(pagination: Pagination, endpoint: str) -> dict[str, str]:
    nav_links = {}
    per_page = pagination.per_page
    this_page = pagination.page
    last_page = pagination.pages
    nav_links["self"] = url_for(endpoint, page=this_page, per_page=per_page)
    nav_links["first"] = url_for(endpoint, page=1, per_page=per_page)
    if pagination.has_prev:
        nav_links["prev"] = url_for(endpoint, page=this_page - 1, per_page=per_page)
    if pagination.has_next:
        nav_links["next"] = url_for(endpoint, page=this_page + 1, per_page=per_page)
    nav_links["last"] = url_for(endpoint, page=last_page, per_page=per_page)
    return nav_links


def _pagination_nav_header_links(pagination: Pagination, endpoint: str) -> str:
    url_dict = _pagination_nav_links(pagination, endpoint)
    link_header = ""
    for rel, url in url_dict.items():
        link_header += f'<{url}>; rel="{rel}", '
    return link_header.strip().strip(",")
