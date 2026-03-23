from http import HTTPStatus

from flask import Response
from flask_restx import Namespace, Resource

from nausicass_global_green_initiative_api.api.applications.dto import (
    create_application_reqparser,
    update_application_reqparser,
    pagination_reqparser,
    applicant_model,
    grant_summary_model,
    award_summary_model,
    application_model,
    pagination_links_model,
    application_pagination_model,
)
from nausicass_global_green_initiative_api.api.applications.handlers import (
    create_application,
    retrieve_my_applications,
    retrieve_all_applications,
    retrieve_application,
    update_application,
    delete_application,
)
from nausicass_global_green_initiative_api.models.application import Application

application_ns = Namespace(name="applications", validate=True)
application_ns.models[applicant_model.name] = applicant_model
application_ns.models[grant_summary_model.name] = grant_summary_model
application_ns.models[award_summary_model.name] = award_summary_model
application_ns.models[application_model.name] = application_model
application_ns.models[pagination_links_model.name] = pagination_links_model
application_ns.models[application_pagination_model.name] = application_pagination_model


@application_ns.route("", endpoint="application_list")
@application_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@application_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@application_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class ApplicationList(Resource):
    """Handles HTTP requests to URL: /applications."""

    @application_ns.doc(security="Bearer")
    @application_ns.response(
        int(HTTPStatus.OK), "Retrieved application list.", application_pagination_model
    )
    @application_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    @application_ns.expect(pagination_reqparser)
    def get(self) -> Response:
        """Retrieve all applications (admin only)."""
        request_data = pagination_reqparser.parse_args()
        page = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_all_applications(page, per_page)

    @application_ns.doc(security="Bearer")
    @application_ns.response(int(HTTPStatus.CREATED), "Application submitted.")
    @application_ns.response(int(HTTPStatus.NOT_FOUND), "Grant not found.")
    @application_ns.response(int(HTTPStatus.CONFLICT), "Already applied to this grant.")
    @application_ns.response(
        int(HTTPStatus.FORBIDDEN), "Administrators cannot apply for grants."
    )
    @application_ns.expect(create_application_reqparser)
    def post(self) -> Response:
        """Submit an application for a grant."""
        application_dict = create_application_reqparser.parse_args()
        return create_application(application_dict)


@application_ns.route("/me", endpoint="my_applications")
@application_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@application_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@application_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class MyApplications(Resource):
    """Handles HTTP requests to URL: /applications/me."""

    @application_ns.doc(security="Bearer")
    @application_ns.response(
        int(HTTPStatus.OK),
        "Retrieved user's applications.",
        application_pagination_model,
    )
    @application_ns.expect(pagination_reqparser)
    def get(self) -> Response:
        """Retrieve current user's applications."""
        request_data = pagination_reqparser.parse_args()
        page = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_my_applications(page, per_page)


@application_ns.route("/<int:application_id>", endpoint="application")
@application_ns.param("application_id", "Application ID")
@application_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@application_ns.response(int(HTTPStatus.NOT_FOUND), "Application not found.")
@application_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@application_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class ApplicationResource(Resource):
    """Handles HTTP requests to URL: /applications/{id}."""

    @application_ns.doc(security="Bearer")
    @application_ns.response(
        int(HTTPStatus.OK), "Retrieved application.", application_model
    )
    @application_ns.response(
        int(HTTPStatus.FORBIDDEN), "Not authorized to view this application."
    )
    @application_ns.marshal_with(application_model)
    def get(self, application_id: int) -> Application:
        """Retrieve a specific application."""
        return retrieve_application(application_id)

    @application_ns.doc(security="Bearer")
    @application_ns.response(int(HTTPStatus.OK), "Application updated.")
    @application_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    @application_ns.expect(update_application_reqparser)
    def put(self, application_id: int) -> Response:
        """Update application status/feedback (admin only)."""
        application_dict = update_application_reqparser.parse_args()
        return update_application(application_id, application_dict)

    @application_ns.doc(security="Bearer")
    @application_ns.response(int(HTTPStatus.NO_CONTENT), "Application deleted.")
    @application_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    def delete(self, application_id: int) -> tuple[str, HTTPStatus]:
        """Delete an application (admin only)."""
        return delete_application(application_id)
