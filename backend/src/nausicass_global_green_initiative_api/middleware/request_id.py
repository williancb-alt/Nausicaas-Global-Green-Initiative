import re
import uuid

from flask import Flask, Response, g, request

# Regex to validate incoming request IDs
# (alphanumeric, dashes, underscores)
# max 128 characters to prevent vulnerabilities
# from spoofed IDs
_VALID_REQUEST_ID = re.compile(r"^[\w\-]{1,128}$")


def register_request_id(app: Flask) -> None:
    """
    This assigns a unique request ID
    to each incoming request
    so that all logs related to the request can
    be viewed together in Azure
    """

    @app.before_request
    def set_request_id() -> None:
        # Use the incoming header if provided and valid,
        # otherwise generate a new UUID
        incoming = request.headers.get("X-Request-ID")
        if incoming and _VALID_REQUEST_ID.match(incoming):
            g.request_id = incoming
        else:
            g.request_id = str(uuid.uuid4())

    @app.after_request
    def add_request_id_header(response: Response) -> Response:
        # Add the request ID to the response headers
        response.headers["X-Request-ID"] = g.request_id
        return response
