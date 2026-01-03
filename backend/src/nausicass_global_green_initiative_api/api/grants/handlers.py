from http import HTTPStatus
from datetime import datetime
from typing import TypedDict

from flask import Response, jsonify, url_for
from flask_restx import abort, marshal
from flask_sqlalchemy.pagination import Pagination

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.api.auth.decorators import (
    token_required,
    admin_token_required,
)
from nausicass_global_green_initiative_api.api.grants.dto import (
    pagination_model,
    grant_name,
)
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.grant import Grant


class GrantDictionary(TypedDict, total=False):
    """Type definition for API requests regarding grants"""

    name: str
    deadline: datetime


@admin_token_required
def create_grant(grant_dict: GrantDictionary) -> Response:
    name = grant_dict["name"]
    if Grant.find_by_name(name):
        error = f"Grant name: {name} already exists, must be unique."
        abort(HTTPStatus.CONFLICT, error, status="fail")
    grant = Grant(**grant_dict)
    owner = User.find_by_public_id(create_grant.public_id)  # type: ignore[attr-defined]
    grant.owner_id = owner.id
    db.session.add(grant)
    db.session.commit()
    response = jsonify(status="success", message=f"New grant added: {name}.")
    response.status_code = HTTPStatus.CREATED
    response.headers["Location"] = url_for("api.grant", name=name, _external=True)
    return response


@token_required
def retrieve_grant_list(page: int, per_page: int) -> Response:
    pagination = Grant.query.paginate(page=page, per_page=per_page, error_out=False)
    response_data = marshal(pagination, pagination_model)
    response_data["links"] = _pagination_nav_links(pagination)
    response = jsonify(response_data)
    response.headers["Link"] = _pagination_nav_header_links(pagination)
    response.headers["Total-Count"] = pagination.total
    return response


@token_required
def retrieve_grant(name: str) -> Grant:
    return Grant.query.filter_by(name=name.lower()).first_or_404(
        description=f"{name} not found in database."
    )


@admin_token_required
def update_grant(
    name: str, grant_dict: GrantDictionary
) -> Response | tuple[dict[str, str], HTTPStatus]:
    grant = Grant.find_by_name(name.lower())
    if grant:
        for k, v in grant_dict.items():
            setattr(grant, k, v)
        db.session.commit()
        message = f"'{name}' was successfully updated"
        response_dict = dict(status="success", message=message)
        return response_dict, HTTPStatus.OK
    try:
        valid_name = grant_name(name.lower())
    except ValueError as e:
        abort(HTTPStatus.BAD_REQUEST, str(e), status="fail")
    grant_dict["name"] = valid_name
    return create_grant(grant_dict)


@admin_token_required
def delete_grant(name: str) -> tuple[str, HTTPStatus]:
    grant = Grant.query.filter_by(name=name.lower()).first_or_404(
        description=f"{name} not found in database."
    )
    db.session.delete(grant)
    db.session.commit()
    return "", HTTPStatus.NO_CONTENT


def _pagination_nav_links(pagination: Pagination) -> dict[str, str]:
    nav_links = {}
    per_page = pagination.per_page
    this_page = pagination.page
    last_page = pagination.pages
    nav_links["self"] = url_for("api.grant_list", page=this_page, per_page=per_page)
    nav_links["first"] = url_for("api.grant_list", page=1, per_page=per_page)
    if pagination.has_prev:
        nav_links["prev"] = url_for(
            "api.grant_list", page=this_page - 1, per_page=per_page
        )
    if pagination.has_next:
        nav_links["next"] = url_for(
            "api.grant_list", page=this_page + 1, per_page=per_page
        )
    nav_links["last"] = url_for("api.grant_list", page=last_page, per_page=per_page)
    return nav_links


def _pagination_nav_header_links(pagination: Pagination) -> str:
    url_dict = _pagination_nav_links(pagination)
    link_header = ""
    for rel, url in url_dict.items():
        link_header += f'<{url}>; rel="{rel}", '
    return link_header.strip().strip(",")
