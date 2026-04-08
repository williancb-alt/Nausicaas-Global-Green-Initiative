# Nausicaas Global Green Initiative API
# Version: 1.0.0

from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.exceptions import HTTPException

from .config import get_config
from .middleware import register_request_id, register_request_logging
from .services.logging import configure_logging
from .services.monitoring import get_monitoring, init_monitoring

cors = CORS(
    supports_credentials=True,
)
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()


def _setup_observability(app: Flask, config_name: str) -> None:
    """
    This function sets up
    logging, monitoring, and request tracking middleware.
    """

    # Configures logging first based on environment
    configure_logging(app, config_name)

    # Initialise error monitoring (Sentry) if DSN is configured
    sentry_dsn = app.config.get("SENTRY_DSN")
    if sentry_dsn:
        init_monitoring(
            dsn=sentry_dsn,
            environment=config_name,
            traces_sample_rate=0.2 if config_name == "production" else 1.0,
            profiles_sample_rate=0.1 if config_name == "production" else 0,
            debug=config_name == "development",
        )
        app.logger.info("Sentry monitoring initialised")

    # Then middleware adding for request ID
    # and request logging
    register_request_id(app)
    register_request_logging(app)


def create_app(config_name: str) -> Flask:
    app = Flask("nausicass_global_green_initiative_api")
    app.config.from_object(get_config(config_name))
    app.url_map.strict_slashes = False

    _setup_observability(app, config_name)

    # Deliberate import placement to avoid a circular import
    from nausicass_global_green_initiative_api.api import api_bp
    from nausicass_global_green_initiative_api.api.health import health_bp
    from nausicass_global_green_initiative_api.services.oauth import init_oauth

    app.register_blueprint(api_bp)
    app.register_blueprint(health_bp)

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    init_oauth(app)

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Server"] = ""
        return response

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(status="fail", message="Resource not found"), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify(status="fail", message="Method not allowed"), 405

    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        if isinstance(e, HTTPException):
            return e
        get_monitoring().capture_exception(e)
        app.logger.exception("Unhandled exception")
        return jsonify(status="fail", message="Internal server error"), 500

    return app
