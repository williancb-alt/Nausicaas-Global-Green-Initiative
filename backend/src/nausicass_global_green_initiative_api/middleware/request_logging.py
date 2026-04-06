import time

from flask import Flask, Response, g, request


def register_request_logging(app: Flask) -> None:
    """
    This function logs every request with
    method, path, status, and duration.
    To enable as much info as possible in Azure.
    """

    @app.before_request
    def start_timer() -> None:
        # Track start time of request
        g.request_start = time.monotonic()

    @app.after_request
    def log_request(response: Response) -> Response:
        # Calculate duration in milliseconds
        duration_ms = round((time.monotonic() - g.request_start) * 1000, 1)

        # Ignore the health check endpoint
        if request.path == "/health":
            return response

        # Log request details including method, path,
        # status code, duration, and request ID
        app.logger.info(
            "%s %s %s (%.1fms)",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
            extra={
                "request_id": g.get("request_id"),
                "method": request.method,
                "path": request.path,
                "status": response.status_code,
                "duration_ms": duration_ms,
                "ip": request.remote_addr,
            },
        )

        # After logging, return response
        return response
