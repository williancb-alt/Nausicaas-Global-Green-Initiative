from http import HTTPStatus
from typing import Union

from flask import Response
from flask_restx import Namespace, Resource

from nausicass_global_green_initiative_api.api.awards.dto import (
    create_award_reqparser,
    update_award_reqparser,
    pagination_reqparser,
    award_owner_model,
    award_model,
    pagination_links_model,
    pagination_model,
)
from nausicass_global_green_initiative_api.api.awards.handlers import (
    create_award,
    retrieve_award_list,
    retrieve_award,
    update_award,
    delete_award,
)
from nausicass_global_green_initiative_api.models.award import Award

award_ns = Namespace(name="awards", validate=True)
award_ns.models[award_owner_model.name] = award_owner_model
award_ns.models[award_model.name] = award_model
award_ns.models[pagination_links_model.name] = pagination_links_model
award_ns.models[pagination_model.name] = pagination_model


@award_ns.route("", endpoint="award_list")
@award_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@award_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@award_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class AwardList(Resource):
    """Handles HTTP requests to URL: /awards."""

    @award_ns.doc(security="Bearer")
    @award_ns.response(int(HTTPStatus.OK), "Retrieved award list.", pagination_model)
    @award_ns.expect(pagination_reqparser)
    def get(self) -> Response:
        """Retrieve a list of awards."""
        request_data = pagination_reqparser.parse_args()
        page = request_data.get("page")
        per_page = request_data.get("per_page")
        return retrieve_award_list(page, per_page)

    @award_ns.doc(security="Bearer")
    @award_ns.response(int(HTTPStatus.CREATED), "Added new award.")
    @award_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    @award_ns.response(int(HTTPStatus.CONFLICT), "Award name already exists.")
    @award_ns.expect(create_award_reqparser)
    def post(self) -> Response:
        """Create an award."""
        award_dict = create_award_reqparser.parse_args()
        return create_award(award_dict)


@award_ns.route("/<name>", endpoint="award")
@award_ns.param("name", "award name")
@award_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
@award_ns.response(int(HTTPStatus.NOT_FOUND), "award not found.")
@award_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@award_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class Award(Resource):
    """Handles HTTP requests to URL: /awards/{name}."""

    @award_ns.doc(security="Bearer")
    @award_ns.response(int(HTTPStatus.OK), "Retrieved award.", award_model)
    @award_ns.marshal_with(award_model)
    def get(self, name: str) -> Award:
        """Retrieve an award."""
        return retrieve_award(name)

    @award_ns.doc(security="Bearer")
    @award_ns.response(int(HTTPStatus.OK), "award was updated.", award_model)
    @award_ns.response(int(HTTPStatus.CREATED), "Added new award.")
    @award_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    @award_ns.expect(update_award_reqparser)
    def put(self, name: str) -> Union[Response, tuple[dict[str, str], HTTPStatus]]:
        """Update an award."""

        award_dict = update_award_reqparser.parse_args()

        return update_award(name, award_dict)

    @award_ns.doc(security="Bearer")
    @award_ns.response(int(HTTPStatus.NO_CONTENT), "award was deleted.")
    @award_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
    def delete(self, name: str) -> tuple[str, HTTPStatus]:
        """Delete an award."""
        return delete_award(name)
