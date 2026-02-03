"""Unit tests for AuditLog model and AuditService."""

import json
import pytest

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.models.audit_log import AuditAction, AuditLog
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.audit_service import AuditService
from tests.util import register_user, login_user


@pytest.fixture
def test_user(client, db):
    """Create a test user for audit log tests."""
    register_user(client, "audituser@test.com", "password123")
    user = User.find_by_email("audituser@test.com")
    return user


@pytest.fixture
def admin_user(client, db):
    """Create an admin user for audit log tests."""
    register_user(client, "admin@test.com", "password123")
    user = User.find_by_email("admin@test.com")
    user.admin = True
    db.session.commit()
    return user


class TestAuditLogModel:
    """Tests for the AuditLog model."""

    def test_create_audit_log_entry(self, client, db, test_user):
        """Test creating a basic audit log entry."""
        log = AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=1,
            user_id=test_user.id,
            user_email=test_user.email,
            success=True,
        )

        assert log.id is not None
        assert log.action == "application_submitted"
        assert log.entity_type == "application"
        assert log.entity_id == 1
        assert log.success is True

    def test_create_failed_audit_log(self, client, db, test_user):
        """Test creating a failed action audit log."""
        log = AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=1,
            user_id=test_user.id,
            user_email=test_user.email,
            success=False,
            failure_reason="Application is submitted and locked",
        )

        assert log.success is False
        assert log.failure_reason == "Application is submitted and locked"

    def test_get_logs_for_entity(self, client, db, test_user):
        """Test retrieving logs for a specific entity."""
        AuditLog.log(
            action=AuditAction.APPLICATION_CREATED.value,
            entity_type="application",
            entity_id=5,
            user_id=test_user.id,
            user_email=test_user.email,
        )
        AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=5,
            user_id=test_user.id,
            user_email=test_user.email,
        )

        logs = AuditLog.get_logs_for_entity("application", 5)

        assert len(logs) == 2


class TestAuditService:
    """Tests for the AuditService."""

    def test_log_application_submitted(self, client, db, test_user):
        """Test logging an application submission via service."""
        with client.application.test_request_context():
            log = AuditService.log_application_submitted(
                application_id=10,
                user_id=test_user.id,
                user_email=test_user.email,
            )

        assert log.action == "application_submitted"
        assert log.success is True

    def test_log_edit_blocked(self, client, db, test_user):
        """Test logging a blocked edit attempt via service."""
        with client.application.test_request_context():
            log = AuditService.log_edit_blocked(
                application_id=10,
                user_id=test_user.id,
                user_email=test_user.email,
                attempted_changes={"funding_amount": 9999},
            )

        assert log.action == "application_edit_blocked"
        assert log.success is False


class TestAuditApiEndpoints:
    """Tests for audit API endpoints."""

    def test_get_audit_logs_requires_admin(self, client, db, test_user):
        """Test that non-admin users cannot access audit logs."""
        login_user(client, "audituser@test.com", "password123")

        response = client.get("/api/v1/audit")

        assert response.status_code == 403

    def test_get_audit_logs_as_admin(self, client, db, admin_user):
        """Test that admin users can access audit logs."""
        AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=1,
        )

        login_user(client, "admin@test.com", "password123")

        response = client.get("/api/v1/audit")

        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert "items" in data
