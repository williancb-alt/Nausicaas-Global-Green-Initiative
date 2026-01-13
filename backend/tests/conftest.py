import pytest
from flask import Flask
from flask.testing import FlaskClient
from flask_sqlalchemy import SQLAlchemy
from pytest import FixtureRequest

from nausicass_global_green_initiative_api import create_app
from nausicass_global_green_initiative_api import db as database
from nausicass_global_green_initiative_api.models.user import User
from tests.util import EMAIL, ADMIN_EMAIL, PASSWORD


@pytest.fixture
def app() -> Flask:
    app = create_app("testing")
    return app


@pytest.fixture
def db(app: Flask, client: FlaskClient, request: FixtureRequest) -> SQLAlchemy:
    database.drop_all()
    database.create_all()
    database.session.commit()

    def fin():
        database.session.remove()

    request.addfinalizer(fin)
    return database


@pytest.fixture
def user(db: SQLAlchemy) -> User:
    user = User(email=EMAIL, password=PASSWORD)
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def admin(db: SQLAlchemy) -> User:
    admin = User(email=ADMIN_EMAIL, password=PASSWORD, admin=True)
    db.session.add(admin)
    db.session.commit()
    return admin
