import os

from nausicass_global_green_initiative_api import create_app
from nausicass_global_green_initiative_api.config import Config


def test_config_development(monkeypatch):
    monkeypatch.setattr(Config, "SECRET_KEY", "test-secret-key-at-least-32-bytes-long")
    app = create_app("development")
    assert app.config["SECRET_KEY"] != "open sesame"
    assert app.config["SECRET_KEY"] == "test-secret-key-at-least-32-bytes-long"
    assert not app.config["TESTING"]
    assert app.config["SQLALCHEMY_DATABASE_URI"] == os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nausicaa_dev"
    )
    assert app.config["TOKEN_EXPIRE_HOURS"] == 0
    assert app.config["TOKEN_EXPIRE_MINUTES"] == 15
    assert "EMAIL_ENABLED" in app.config
    assert "SMTP_SENDER" in app.config
    assert "SMTP_SERVER" in app.config


def test_config_testing(monkeypatch):
    monkeypatch.setattr(Config, "SECRET_KEY", "test-secret-key-at-least-32-bytes-long")
    app = create_app("testing")
    assert app.config["SECRET_KEY"] != "open sesame"
    assert app.config["TESTING"]
    assert app.config["SQLALCHEMY_DATABASE_URI"] == os.getenv(
        "TEST_DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/nausicaa_test",
    )
    assert app.config["TOKEN_EXPIRE_HOURS"] == 0
    assert app.config["TOKEN_EXPIRE_MINUTES"] == 0
    assert "EMAIL_ENABLED" in app.config
    assert "SMTP_SENDER" in app.config
    assert "SMTP_SERVER" in app.config


def test_config_production(monkeypatch):
    monkeypatch.setattr(Config, "SECRET_KEY", "test-secret-key-at-least-32-bytes-long")
    app = create_app("production")
    assert app.config["SECRET_KEY"] != "open sesame"
    assert not app.config["TESTING"]
    assert app.config["SQLALCHEMY_DATABASE_URI"] == os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nausicaa_prod"
    )
    assert app.config["TOKEN_EXPIRE_HOURS"] == 1
    assert app.config["TOKEN_EXPIRE_MINUTES"] == 0
    assert "EMAIL_ENABLED" in app.config
    assert "SMTP_SENDER" in app.config
    assert "SMTP_SERVER" in app.config
