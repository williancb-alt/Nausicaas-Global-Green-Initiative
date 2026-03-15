import re

from flask_restx import Model
from flask_restx.fields import String, Boolean
from flask_restx.inputs import email
from flask_restx.reqparse import RequestParser

user_model = Model(
    "User",
    {
        "email": String,
        "public_id": String,
        "admin": Boolean,
        "registered_on": String(attribute="registered_on_str"),
        "token_expires_in": String,
    },
)


def password_type(value: str) -> str:
    """Validate password meets minimum requirements."""
    if len(value) < 8:
        raise ValueError(
            "Password must contain a minimum of 8 characters, "
            "1 capital letter and 1 number"
        )
    if not re.search(r"[A-Z]", value):
        raise ValueError(
            "Password must contain a minimum of 8 characters, "
            "1 capital letter and 1 number"
        )
    if not re.search(r"[0-9]", value):
        raise ValueError(
            "Password must contain a minimum of 8 characters, "
            "1 capital letter and 1 number"
        )
    return value


auth_req_parser = RequestParser(bundle_errors=True)
auth_req_parser.add_argument(
    name="email", type=email(), location="form", required=True, nullable=False
)
auth_req_parser.add_argument(
    name="password",
    type=password_type,
    location="form",
    required=True,
    nullable=False,
)

forgot_password_req_parser = RequestParser(bundle_errors=True)
forgot_password_req_parser.add_argument(
    name="email", type=email(), location="form", required=True, nullable=False
)

reset_password_req_parser = RequestParser(bundle_errors=True)
reset_password_req_parser.add_argument(
    name="token", type=str, location="form", required=True, nullable=False
)
reset_password_req_parser.add_argument(
    name="password",
    type=password_type,
    location="form",
    required=True,
    nullable=False,
)
