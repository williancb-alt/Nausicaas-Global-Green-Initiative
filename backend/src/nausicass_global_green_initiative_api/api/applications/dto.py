from flask_restx import Model
from flask_restx.fields import Boolean, Integer, List, Nested, Raw, String
from flask_restx.inputs import positive
from flask_restx.reqparse import RequestParser


def valid_status(status: str) -> str:
    """Validate application status."""
    valid_statuses = ["pending_review", "in_review", "approved", "denied"]
    if status not in valid_statuses:
        raise ValueError(
            f"'{status}' is not a valid status. Must be one of: {', '.join(valid_statuses)}"
        )
    return status


# Request parsers
create_application_reqparser = RequestParser(bundle_errors=True)
create_application_reqparser.add_argument(
    "grant_name",
    type=str,
    location="json",
    required=True,
    nullable=False,
    help="Name of the grant to apply for",
)
create_application_reqparser.add_argument(
    "field_values",
    type=dict,
    location="json",
    required=False,
    nullable=True,
    help="JSON object containing field values",
)

update_application_reqparser = RequestParser(bundle_errors=True)
update_application_reqparser.add_argument(
    "status",
    type=valid_status,
    location="json",
    required=False,
    nullable=True,
    help="Application status: pending_review, in_review, approved, denied",
)
update_application_reqparser.add_argument(
    "feedback",
    type=str,
    location="json",
    required=False,
    nullable=True,
    help="Admin feedback on the application",
)

pagination_reqparser = RequestParser(bundle_errors=True)
pagination_reqparser.add_argument("page", type=positive, required=False, default=1)
pagination_reqparser.add_argument(
    "per_page", type=positive, required=False, choices=[5, 10, 25, 50, 100], default=10
)

# Response models
applicant_model = Model(
    "Applicant",
    {
        "email": String,
        "public_id": String,
    },
)

grant_summary_model = Model(
    "GrantSummary",
    {
        "name": String,
        "description": String,
        "custom_fields": Raw,
    },
)

application_model = Model(
    "Application",
    {
        "id": Integer,
        "submitted_at": String(attribute="submitted_at_str"),
        "submitted_date": String,
        "status": String,
        "field_values": Raw,
        "feedback": String,
        "applicant": Nested(applicant_model, attribute="user"),
        "grant": Nested(grant_summary_model),
    },
)

pagination_links_model = Model(
    "ApplicationNavLinks",
    {"self": String, "prev": String, "next": String, "first": String, "last": String},
)

application_pagination_model = Model(
    "ApplicationPagination",
    {
        "links": Nested(pagination_links_model, skip_none=True),
        "has_prev": Boolean,
        "has_next": Boolean,
        "page": Integer,
        "total_pages": Integer(attribute="pages"),
        "items_per_page": Integer(attribute="per_page"),
        "total_items": Integer(attribute="total"),
        "items": List(Nested(application_model)),
    },
)
