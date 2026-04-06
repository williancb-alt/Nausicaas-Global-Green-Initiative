import logging
from datetime import datetime
from http import HTTPStatus
from typing import TypedDict

from flask import Response, jsonify, url_for
from flask_restx import abort, marshal
from flask_sqlalchemy.pagination import Pagination

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.api.auth.decorators import (
    admin_token_required,
    token_required,
)
from nausicass_global_green_initiative_api.api.awards.dto import (
    award_name,
    pagination_model,
)
from nausicass_global_green_initiative_api.models.award import Award
from nausicass_global_green_initiative_api.models.user import User

logger = logging.getLogger(__name__)


class AwardDictionary(TypedDict, total=False):
    """Type definition for API requests regarding awards"""

    name: str
    deadline: datetime
    description: str


@admin_token_required
def create_award(award_dict: AwardDictionary) -> Response:
    name = award_dict["name"]
    if Award.find_by_name(name):
        logger.warning(
            "Award creation failed: duplicate name", extra={"award_name": name}
        )
        error = f"Award name: {name} already exists, must be unique."
        abort(HTTPStatus.CONFLICT, error, status="fail")

    # Create award
    award_data = {k: v for k, v in award_dict.items()}
    award = Award(**award_data)

    owner = User.find_by_public_id(create_award.public_id)  # type: ignore[attr-defined]
    award.owner_id = owner.id
    db.session.add(award)
    db.session.commit()
    logger.info("Award created", extra={"award_name": name})
    response = jsonify(status="success", message=f"New award added: {name}.")
    response.status_code = HTTPStatus.CREATED
    response.headers["Location"] = url_for("api.award", name=name, _external=True)
    return response


@token_required
def retrieve_award_list(page: int, per_page: int) -> Response:
    pagination = Award.query.paginate(page=page, per_page=per_page, error_out=False)
    response_data = marshal(pagination, pagination_model)
    response_data["links"] = _pagination_nav_links(pagination)
    response = jsonify(response_data)
    response.headers["Link"] = _pagination_nav_header_links(pagination)
    response.headers["Total-Count"] = pagination.total
    return response


@token_required
def retrieve_award(name: str) -> Award:
    return Award.query.filter_by(name=name).first_or_404(
        description=f"{name} not found in database."
    )


@admin_token_required
def update_award(
    name: str, award_dict: AwardDictionary
) -> Response | tuple[dict[str, str], HTTPStatus]:
    award = Award.find_by_name(name)
    if award:
        for k, v in award_dict.items():
            setattr(award, k, v)
        db.session.commit()
        logger.info("Award updated", extra={"award_name": name})
        message = f"'{name}' was successfully updated"
        response_dict = dict(status="success", message=message)
        return response_dict, HTTPStatus.OK
    try:
        valid_name = award_name(name)
    except ValueError as e:
        logger.warning(
            "Award name validation failed", extra={"award_name": name, "error": str(e)}
        )
        abort(HTTPStatus.BAD_REQUEST, str(e), status="fail")
    award_dict["name"] = valid_name
    return create_award(award_dict)


@admin_token_required
def delete_award(name: str) -> tuple[str, HTTPStatus]:
    award = Award.query.filter_by(name=name).first_or_404(
        description=f"{name} not found in database."
    )
    db.session.delete(award)
    db.session.commit()
    logger.info("Award deleted", extra={"award_name": name})
    return "", HTTPStatus.NO_CONTENT


def _pagination_nav_links(pagination: Pagination) -> dict[str, str]:
    nav_links = {}
    per_page = pagination.per_page
    this_page = pagination.page
    last_page = pagination.pages
    nav_links["self"] = url_for("api.award_list", page=this_page, per_page=per_page)
    nav_links["first"] = url_for("api.award_list", page=1, per_page=per_page)
    if pagination.has_prev:
        nav_links["prev"] = url_for(
            "api.award_list", page=this_page - 1, per_page=per_page
        )
    if pagination.has_next:
        nav_links["next"] = url_for(
            "api.award_list", page=this_page + 1, per_page=per_page
        )
    nav_links["last"] = url_for("api.award_list", page=last_page, per_page=per_page)
    return nav_links


def _pagination_nav_header_links(pagination: Pagination) -> str:
    url_dict = _pagination_nav_links(pagination)
    link_header = ""
    for rel, url in url_dict.items():
        link_header += f'<{url}>; rel="{rel}", '
    return link_header.strip().strip(",")
