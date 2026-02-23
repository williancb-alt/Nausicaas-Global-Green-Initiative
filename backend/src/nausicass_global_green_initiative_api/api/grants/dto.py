from __future__ import annotations
import re
from datetime import date, datetime, time, timezone

import json
from http import HTTPStatus
from flask_restx import abort
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.grant import Grant
from flask import Request
from nausicass_global_green_initiative_api.api.grants.types import GrantDictionary

from dateutil import parser
from flask_restx import Model
from flask_restx.fields import (
    Boolean,
    DateTime,
    Integer,
    List,
    Nested,
    Raw,
    String,
    Url,
)
from flask_restx.inputs import positive, boolean
from flask_restx.reqparse import RequestParser

from nausicass_global_green_initiative_api.util.datetime_util import (
    make_tzaware,
    DATE_MONTH_NAME,
)


def apply_custom_fields_change(
    grant: Grant, grant_dict: GrantDictionary, changes: dict
) -> None:
    custom_fields_str = grant_dict.get("custom_fields")
    if not custom_fields_str:
        return

    try:
        parsed = json.loads(custom_fields_str)
    except json.JSONDecodeError:
        abort(
            HTTPStatus.BAD_REQUEST,
            "custom_fields must be valid JSON",
            status="fail",
        )

    if grant.custom_fields != parsed:
        changes["custom_fields"] = {
            "old": grant.custom_fields,
            "new": parsed,
        }
    grant.custom_fields = parsed


def apply_standard_field_changes(
    grant: Grant, grant_dict: GrantDictionary, changes: dict
) -> None:
    for k, v in grant_dict.items():
        if k == "custom_fields" or v is None:
            continue
        old_value = getattr(grant, k)
        if old_value != v:
            changes[k] = {
                "old": str(old_value) if old_value is not None else None,
                "new": str(v) if v is not None else None,
            }
        setattr(grant, k, v)


def is_admin_check(req: Request) -> bool:
    token = req.cookies.get("access_token")
    if not token:
        auth_header = req.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        return False

    result = User.decode_access_token(token)
    if result.failure:
        return False

    return bool(result.value.get("admin", False))


def grant_name(name: str) -> str:
    """Validation method - string must contain only letters,numbers,' ','-' and '_'."""
    if not re.compile(r"^[\w\s-]+$").match(name):
        raise ValueError(
            f"'{name}' contains one or more invalid characters. Grant name must "
            "contain only letters, spaces, numbers, hyphen and underscore characters."
        )
    return name


def _parse_date_str(date_str: str) -> datetime:
    try:
        return parser.parse(date_str)
    except ValueError:
        raise ValueError(
            (
                f"Failed to parse '{date_str}' as a valid date. You can use any format "
                "recognized by dateutil.parser. For example, all of the strings below "
                "are valid ways to represent the same date: '2018-5-13' -or- "
                "'05/13/2018' -or- 'May 13 2018'."
            )
        )


def _ensure_future_date(parsed_date: datetime) -> None:
    if parsed_date.date() < date.today():
        raise ValueError(
            (
                f"Successfully parsed {parsed_date.strftime(DATE_MONTH_NAME)}. However, "
                "this value must be a date in the future and "
                f"{parsed_date.strftime(DATE_MONTH_NAME)} is BEFORE "
                f"{datetime.now().strftime(DATE_MONTH_NAME)}"
            )
        )


def _deadline_utc_from_date(d: date) -> datetime:
    deadline = datetime.combine(d, time.max)
    return make_tzaware(deadline, use_tz=timezone.utc)


def future_date_from_string(date_str: str) -> datetime:
    """Validation method for a date in the future, formatted as a string."""
    parsed_date = _parse_date_str(date_str)
    _ensure_future_date(parsed_date)
    return _deadline_utc_from_date(parsed_date.date())


def valid_phone(phone: str) -> str:
    """Validate phone number format."""
    # Supports: 555-123-4567, (555)123-4567, +1-555-123-4567, +1 (555) 123-4567
    pattern = (
        r"^[\+]?[0-9]{0,3}[-\s]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
    )
    if not re.match(pattern, phone):
        raise ValueError(
            f"'{phone}' is not a valid phone number. Please use a format like "
            "+1 (555) 123-4567 or 555-123-4567."
        )
    return phone


def valid_email(email: str) -> str:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise ValueError(f"'{email}' is not a valid email address.")
    return email


create_grant_reqparser = RequestParser(bundle_errors=True)
create_grant_reqparser.add_argument(
    "name",
    type=grant_name,
    location="form",
    required=True,
    nullable=False,
    case_sensitive=True,
)
create_grant_reqparser.add_argument(
    "deadline",
    type=future_date_from_string,
    location="form",
    required=True,
    nullable=False,
)
create_grant_reqparser.add_argument(
    "description",
    type=str,
    location="form",
    required=True,
    nullable=False,
)
create_grant_reqparser.add_argument(
    "custom_fields",
    type=str,
    location="form",
    required=False,
    nullable=True,
)
create_grant_reqparser.add_argument(
    "hidden",
    type=boolean,
    location="form",
    required=False,
    default=False,
)

pagination_reqparser = RequestParser(bundle_errors=True)
pagination_reqparser.add_argument("page", type=positive, required=False, default=1)
pagination_reqparser.add_argument(
    "per_page", type=positive, required=False, choices=[5, 10, 25, 50, 100], default=10
)

grant_owner_model = Model("Grant Owner", {"email": String, "public_id": String})

grant_model = Model(
    "grant",
    {
        "name": String,
        "created_at_iso8601": DateTime(attribute="created_at"),
        "created_at_rfc822": DateTime(attribute="created_at", dt_format="rfc822"),
        "deadline": String(attribute="deadline_str"),
        "deadline_passed": Boolean,
        "time_remaining": String(attribute="time_remaining_str"),
        "description": String,
        "custom_fields": Raw,
        "hidden": Boolean,
        "owner": Nested(grant_owner_model),
        "link": Url("api.grant"),
    },
)

pagination_links_model = Model(
    "Nav Links",
    {"self": String, "prev": String, "next": String, "first": String, "last": String},
)

pagination_model = Model(
    "Pagination",
    {
        "links": Nested(pagination_links_model, skip_none=True),
        "has_prev": Boolean,
        "has_next": Boolean,
        "page": Integer,
        "total_pages": Integer(attribute="pages"),
        "items_per_page": Integer(attribute="per_page"),
        "total_items": Integer(attribute="total"),
        "items": List(Nested(grant_model)),
    },
)

update_grant_reqparser = create_grant_reqparser.copy()
update_grant_reqparser.remove_argument("name")
update_grant_reqparser.replace_argument(
    "deadline",
    type=future_date_from_string,
    location="form",
    required=False,
    nullable=True,
)
update_grant_reqparser.replace_argument(
    "description",
    type=str,
    location="form",
    required=False,
    nullable=True,
)
