from flask import Blueprint
from flask_restx import Api

from nausicass_global_green_initiative_api.api.auth.endpoints import auth_ns
from nausicass_global_green_initiative_api.api.grants.endpoints import grant_ns

api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
authorizations = {"Bearer": {"type": "apiKey", "in": "header", "name": "Authorization"}}

api = Api(
    api_bp,
    version="1.0",
    title="Flask API with JWT-Based Authentication",
    description="Welcome to the Swagger UI documentation site!",
    doc="/ui",
    authorizations=authorizations,
)

api.add_namespace(auth_ns, path="/auth")
api.add_namespace(grant_ns, path="/grants")
