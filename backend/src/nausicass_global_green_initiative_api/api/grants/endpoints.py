from http import HTTPStatus
from typing import Union

from flask import Response
from flask_restx import Namespace, Resource

from nausicass_global_green_initiative_api.api.grants.dto import (
    create_grant_reqparser,
    update_grant_reqparser,
    pagination_reqparser,
    grant_owner_model,
    grant_model,
    pagination_links_model,
    pagination_model,
)
from nausicass_global_green_initiative_api.api.grants.handlers import (
    create_grant,
    retrieve_grant_list,
    retrieve_grant,
    update_grant,
    delete_grant,
)
from nausicass_global_green_initiative_api.models.grant import Grant

grant_ns = Namespace(name="grants", validate=True)
grant_ns.models[grant_owner_model.name] = grant_owner_model
grant_ns.models[grant_model.name] = grant_model
grant_ns.models[pagination_links_model.name] = pagination_links_model
grant_ns.models[pagination_model.name] = pagination_model


@grant_ns.route("", endpoint="grant_list")
@grant_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@grant_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@grant_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class GrantList(Resource):
    """Handles HTTP requests to URL: /grants."""

    @grant_ns.doc(security="Bearer")
    @grant_ns.response(int(HTTPStatus.OK), "Retrieved grant list.", pagination_model)
    @grant_ns.expect(pagination_reqparser)
    def get(self) -> Response:
        """Retrieve a list of grants."""
        request_data = pagination_reqparser.parse_args()
        page = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_grant_list(page, per_page)

    @grant_ns.doc(security="Bearer")
    @grant_ns.response(int(HTTPStatus.CREATED), "Added new grant.")
    @grant_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    @grant_ns.response(int(HTTPStatus.CONFLICT), "Grant name already exists.")
    @grant_ns.expect(create_grant_reqparser)
    def post(self) -> Response:
        """Create a grant."""
        grant_dict = create_grant_reqparser.parse_args()
        return create_grant(grant_dict)


@grant_ns.route("/<name>", endpoint="grant")
@grant_ns.param("name", "grant name")
@grant_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@grant_ns.response(int(HTTPStatus.NOT_FOUND), "grant not found.")
@grant_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@grant_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class Grant(Resource):
    """Handles HTTP requests to URL: /grants/{name}."""

    @grant_ns.doc(security="Bearer")
    @grant_ns.response(int(HTTPStatus.OK), "Retrieved grant.", grant_model)
    @grant_ns.marshal_with(grant_model)
    def get(self, name: str) -> Grant:
        """Retrieve a grant."""
        return retrieve_grant(name)

    @grant_ns.doc(security="Bearer")
    @grant_ns.response(int(HTTPStatus.OK), "grant was updated.", grant_model)
    @grant_ns.response(int(HTTPStatus.CREATED), "Added new grant.")
    @grant_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    @grant_ns.expect(update_grant_reqparser)
    def put(self, name: str) -> Union[Response, tuple[dict[str, str], HTTPStatus]]:
        """Update a grant."""

        grant_dict = update_grant_reqparser.parse_args()

        return update_grant(name, grant_dict)

    @grant_ns.doc(security="Bearer")
    @grant_ns.response(int(HTTPStatus.NO_CONTENT), "grant was deleted.")
    @grant_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    def delete(self, name: str) -> tuple[str, HTTPStatus]:
        """Delete a grant."""
        return delete_grant(name)
