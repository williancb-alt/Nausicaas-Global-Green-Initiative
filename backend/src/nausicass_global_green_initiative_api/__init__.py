from flask import Flask
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
    app = Flask("nausicass-global-green-initiative-api")
    app.config.from_object(get_config(config_name))

    # Deliberate import placement to avoid a circular import
    from nausicass_global_green_initiative_api.api import api_bp

    app.register_blueprint(api_bp)

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    return app
