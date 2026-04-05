# Nausicaas Global Green Initiative API
# Version: 1.0.0

from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from .config import get_config

cors = CORS(
    supports_credentials=True,
)
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()


def create_app(config_name: str) -> Flask:
    app = Flask("nausicass_global_green_initiative_api")
    app.config.from_object(get_config(config_name))

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
        response.headers["Cross-Origin-Resource-Policy"] = "same-site"
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return response

    app.url_map.strict_slashes = False

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(status="fail", message="Resource not found"), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify(status="fail", message="Method not allowed"), 405

    return app
