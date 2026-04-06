import uuid

from flask import g, request


def register_request_id(app):
    """
    This assigns a unique request ID
    to each incoming request
    so that all logs related to the request can
    be viewed together in Azure
    """

    @app.before_request
    def set_request_id():
        # Use the incoming header if provided,
        # otherwise generate a new UUID
        g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

    @app.after_request
    def add_request_id_header(response):
        # Add the request ID to the response headers
        response.headers["X-Request-ID"] = g.request_id
        return response
