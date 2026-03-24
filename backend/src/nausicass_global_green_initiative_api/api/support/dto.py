from flask_restx import Model
from flask_restx.fields import Integer, Nested, String
from flask_restx.reqparse import RequestParser

from nausicass_global_green_initiative_api.api.applications.dto import applicant_model

create_support_reqparser = RequestParser(bundle_errors=True)
create_support_reqparser.add_argument(
    "application_id",
    type=int,
    location="json",
    required=True,
    nullable=False,
    help="ID of the application",
)
create_support_reqparser.add_argument(
    "subject",
    type=str,
    location="json",
    required=True,
    nullable=False,
    help="Subject of the support message",
)
create_support_reqparser.add_argument(
    "message",
    type=str,
    location="json",
    required=True,
    nullable=False,
    help="Message content",
)

reply_support_reqparser = RequestParser(bundle_errors=True)
reply_support_reqparser.add_argument(
    "message",
    type=str,
    location="json",
    required=True,
    nullable=False,
    help="Reply message content",
)

support_message_model = Model(
    "SupportMessage",
    {
        "id": Integer,
        "subject": String,
        "message": String,
        "admin_response": String,
        "status": String,
        "created_at_str": String,
        "answered_at_str": String,
        "user": Nested(applicant_model),
        "application_id": Integer,
    },
)
