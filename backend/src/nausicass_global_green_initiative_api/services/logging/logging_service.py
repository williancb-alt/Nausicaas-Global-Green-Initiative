import logging
import sys

from flask import Flask

from .json_logs_format import JSONLogsFormat


def configure_logging(app: Flask, env: str) -> None:
    """
    This function configures logging based on env.

    - Production: JSON format for Azure Monitor
    - Development: readable console output with debug logs
    - Testing: warning level only to reduce noise in output
    """

    # First clear any existing handlers on the Flask logger
    app.logger.handlers.clear()

    # Create a new stream handler for stdout
    handler = logging.StreamHandler(sys.stdout)

    # Configure formatter and log level based on env
    if env == "production":
        handler.setFormatter(JSONLogsFormat())
        log_level = logging.INFO
    elif env == "testing":
        handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s: %(message)s"))
        log_level = logging.WARNING
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s [%(levelname)s] %(name)s "
                "(%(module)s:%(lineno)d): %(message)s"
            )
        )
        log_level = logging.DEBUG

    # Set handler and level for the Flask app logger
    app.logger.addHandler(handler)
    app.logger.setLevel(log_level)

    # Also need to configure the root logger
    # for libraries using logging.getLogger(__name__)
    # Clear existing handlers first to avoid duplicates
    # across multiple calls (e.g. in tests)
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(log_level)

    # Set third-party loggers to warning levels
    # to avoid too many logs
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if env == "development" else logging.WARNING
    )

    # Log that logging is configured with the chosen level
    app.logger.info("Logging configured", extra={"env": env, "level": log_level})
