import re
from datetime import date, datetime, time, timezone

from dateutil import parser
from flask_restx import Model
from flask_restx.fields import Boolean, DateTime, Integer, List, Nested, String, Url
from flask_restx.inputs import positive
from flask_restx.reqparse import RequestParser

from nausicass_global_green_initiative_api.util.datetime_util import (
    make_tzaware,
    DATE_MONTH_NAME,
)


def grant_name(name):
    """Validation method - string must contain only letters,numbers,' ','-' and '_'."""
    if not re.compile(r"^[\w\s-]+$").match(name):
        raise ValueError(
            f"'{name}' contains one or more invalid characters. Grant name must "
            "contain only letters, spaces, numbers, hyphen and underscore characters."
        )
    return name


def future_date_from_string(date_str):
    """Validation method for a date in the future, formatted as a string."""
    try:
        parsed_date = parser.parse(date_str)
    except ValueError:
        raise ValueError(
            f"Failed to parse '{date_str}' as a valid date. You can use any format "
            "recognized by dateutil.parser. For example, all of the strings below "
            "are valid ways to represent the same date: '2018-5-13' -or- '05/13/2018' "
            "-or- 'May 13 2018'."
        )

    if parsed_date.date() < date.today():
        raise ValueError(
            f"Successfully parsed {date_str} as "
            f"{parsed_date.strftime(DATE_MONTH_NAME)}. However, this value must be a "
            f"date in the future and {parsed_date.strftime(DATE_MONTH_NAME)} is BEFORE "
            f"{datetime.now().strftime(DATE_MONTH_NAME)}"
        )
    deadline = datetime.combine(parsed_date.date(), time.max)
    deadline_utc = make_tzaware(deadline, use_tz=timezone.utc)
    return deadline_utc


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
