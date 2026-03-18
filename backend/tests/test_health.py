from http import HTTPStatus
from unittest.mock import patch

from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy.exc import SQLAlchemyError

from nausicass_global_green_initiative_api import db


def test_health_endpoint_ok(app: Flask, client: FlaskClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == HTTPStatus.OK
    assert resp.get_json() == {"status": "ok"}


def test_ready_endpoint_ok(app: Flask, client: FlaskClient) -> None:
    resp = client.get("/ready")
    assert resp.status_code == HTTPStatus.OK
    assert resp.get_json() == {"status": "ready"}


def test_ready_endpoint_degraded_on_db_error(app: Flask, client: FlaskClient) -> None:
    with patch.object(db.session, "execute", side_effect=SQLAlchemyError("boom")):
        resp = client.get("/ready")
        assert resp.status_code == HTTPStatus.SERVICE_UNAVAILABLE
        assert resp.get_json() == {"status": "degraded"}
