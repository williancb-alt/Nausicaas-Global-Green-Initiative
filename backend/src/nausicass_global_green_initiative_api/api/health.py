from flask import Blueprint, jsonify
from sqlalchemy import text

from nausicass_global_green_initiative_api import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok"), 200


@health_bp.route("/ready", methods=["GET"])
def ready():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify(status="ready"), 200
    except Exception:
        return jsonify(status="degraded"), 503
