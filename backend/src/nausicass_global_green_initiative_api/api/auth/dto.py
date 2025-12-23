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


auth_req_parser = RequestParser(bundle_errors=True)
auth_req_parser.add_argument(
    name="email", type=email(), location="form", required=True, nullable=False
)
auth_req_parser.add_argument(
    name="password", type=str, location="form", required=True, nullable=False
)
