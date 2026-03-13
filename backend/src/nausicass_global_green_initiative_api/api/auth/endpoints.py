from http import HTTPStatus

from flask import Response
from flask_restx import Namespace, Resource

from nausicass_global_green_initiative_api.api.auth.dto import (
    auth_req_parser,
    forgot_password_req_parser,
    reset_password_req_parser,
    user_model,
)
from nausicass_global_green_initiative_api.api.auth.handlers import (
    process_registration_request,
    process_login_request,
    get_logged_in_user,
    process_logout_request,
    process_forgot_password_request,
    process_reset_password_request,
)
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.oauth import (
    start_oauth_login,
    handle_oauth_callback,
)

auth_ns = Namespace(name="auth", validate=True)
auth_ns.models[user_model.name] = user_model


@auth_ns.route("/oauth/<string:provider>", endpoint="auth_oauth_login")
class OAuthLogin(Resource):
    def get(self, provider: str) -> Response:
        return start_oauth_login(provider)


@auth_ns.route("/oauth/<string:provider>/callback", endpoint="auth_oauth_callback")
class OAuthCallback(Resource):
    def get(self, provider: str) -> Response:
        return handle_oauth_callback(provider)


@auth_ns.route("/register", endpoint="auth_register")
class RegisterUser(Resource):
    """HTTP request handler for URL: /api/v1/auth/register."""

    @auth_ns.expect(auth_req_parser)
    @auth_ns.response(int(HTTPStatus.CREATED), "User was successfully created.")
    @auth_ns.response(int(HTTPStatus.CONFLICT), "Email address is already registered.")
    @auth_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
    @auth_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
    def post(self) -> Response:
        """Register a new user and return an access token."""
        request_data = auth_req_parser.parse_args()
        email = request_data.get("email")
        password = request_data.get("password")
        return process_registration_request(email, password)


@auth_ns.route("/login", endpoint="auth_login")
class LoginUser(Resource):
    """HTTP request handler for URL: /api/v1/auth/login."""

    @auth_ns.expect(auth_req_parser)
    @auth_ns.response(int(HTTPStatus.OK), "Login succeeded.")
    @auth_ns.response(int(HTTPStatus.UNAUTHORIZED), "email or password does not match")
    @auth_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
    @auth_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
    def post(self) -> Response:
        """Authenticate an existing user and return an access token."""
        request_data = auth_req_parser.parse_args()
        email = request_data.get("email")
        password = request_data.get("password")
        return process_login_request(email, password)


@auth_ns.route("/user", endpoint="auth_user")
class GetUser(Resource):
    """Handles HTTP requests to URL: /api/v1/auth/user."""

    @auth_ns.doc(security="Bearer")
    @auth_ns.response(int(HTTPStatus.OK), "Token is currently valid.", user_model)
    @auth_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
    @auth_ns.response(int(HTTPStatus.UNAUTHORIZED), "Token is invalid or expired.")
    @auth_ns.marshal_with(user_model)
    def get(self) -> User:
        """Validate access token and return user info."""
        return get_logged_in_user()


@auth_ns.route("/logout", endpoint="auth_logout")
class LogoutUser(Resource):
    """Handles HTTP requests to URL: /auth/logout."""

    @auth_ns.doc(security="Bearer")
    @auth_ns.response(int(HTTPStatus.OK), "Log out succeeded, token is no longer valid.")
    @auth_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
    @auth_ns.response(int(HTTPStatus.UNAUTHORIZED), "Token is invalid or expired.")
    @auth_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
    def post(self) -> Response:
        """Add token to blacklist, deauthenticating the current user."""
        return process_logout_request()


@auth_ns.route("/forgot-password", endpoint="auth_forgot_password")
class ForgotPassword(Resource):
    """HTTP request handler for URL: /api/v1/auth/forgot-password."""

    @auth_ns.expect(forgot_password_req_parser)
    @auth_ns.response(int(HTTPStatus.OK), "Reset email sent if account exists.")
    @auth_ns.response(int(HTTPStatus.BAD_REQUEST), "Validation error.")
    def post(self) -> Response:
        """Send a password reset email if the account exists."""
        request_data = forgot_password_req_parser.parse_args()
        email = request_data.get("email")
        return process_forgot_password_request(email)


@auth_ns.route("/reset-password", endpoint="auth_reset_password")
class ResetPassword(Resource):
    """HTTP request handler for URL: /api/v1/auth/reset-password."""

    @auth_ns.expect(reset_password_req_parser)
    @auth_ns.response(int(HTTPStatus.OK), "Password reset successfully.")
    @auth_ns.response(int(HTTPStatus.BAD_REQUEST), "Token is invalid or expired.")
    def post(self) -> Response:
        """Reset password using a valid reset token."""
        request_data = reset_password_req_parser.parse_args()
        token = request_data.get("token")
        password = request_data.get("password")
        return process_reset_password_request(token, password)
