# Nausicaas Global Green Initiative API
# Version: 1.0.0

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from .config import get_config
from .middleware import register_request_id, register_request_logging
from .services.logging import configure_logging

cors = CORS(
    supports_credentials=True,
)
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()


def _setup_observability(app: Flask, config_name: str) -> None:
    """
    This function sets up
    logging and request tracking middleware.
    """

    # Configures logging first based on environment
    configure_logging(app, config_name)

    # Then middleware adding for request ID
    # and request logging
    register_request_id(app)
    register_request_logging(app)


def create_app(config_name: str) -> Flask:
    app = Flask("nausicass_global_green_initiative_api")
    app.config.from_object(get_config(config_name))

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
    return app
