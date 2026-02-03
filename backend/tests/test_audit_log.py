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
        assert log.user_id == test_user.id
        assert log.user_email == "audituser@test.com"
        assert log.success is True
        assert log.timestamp is not None

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
        assert log.action == "application_edit_blocked"

    def test_audit_log_with_details(self, client, db, test_user):
        """Test creating an audit log with JSON details."""
        details = json.dumps({"field": "funding_amount", "old_value": 5000, "new_value": 10000})

        log = AuditLog.log(
            action=AuditAction.APPLICATION_EDITED.value,
            entity_type="application",
            entity_id=1,
            user_id=test_user.id,
            user_email=test_user.email,
            is_admin=True,
            details=details,
            success=True,
        )

        assert log.details is not None
        parsed_details = json.loads(log.details)
        assert parsed_details["field"] == "funding_amount"
        assert parsed_details["old_value"] == 5000

    def test_get_logs_for_entity(self, client, db, test_user):
        """Test retrieving logs for a specific entity."""
        # Create multiple logs for same entity
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
        # Create log for different entity
        AuditLog.log(
            action=AuditAction.APPLICATION_CREATED.value,
            entity_type="application",
            entity_id=6,
            user_id=test_user.id,
            user_email=test_user.email,
        )

        logs = AuditLog.get_logs_for_entity("application", 5)

        assert len(logs) == 2
        # Should be ordered by timestamp descending (most recent first)
        assert logs[0].action == "application_submitted"
        assert logs[1].action == "application_created"

    def test_get_recent_logs(self, client, db, test_user):
        """Test retrieving recent logs with limit."""
        # Create several logs
        for i in range(5):
            AuditLog.log(
                action=AuditAction.GRANT_CREATED.value,
                entity_type="grant",
                entity_id=i,
                user_id=test_user.id,
                user_email=test_user.email,
            )

        logs = AuditLog.get_recent_logs(limit=3)

        assert len(logs) == 3

    def test_get_failed_attempts(self, client, db, test_user):
        """Test retrieving only failed attempts."""
        # Create mix of successful and failed logs
        AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=1,
            success=True,
        )
        AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=1,
            success=False,
            failure_reason="Blocked",
        )
        AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=2,
            success=False,
            failure_reason="Blocked",
        )

        failed_logs = AuditLog.get_failed_attempts()

        assert len(failed_logs) == 2
        assert all(log.success is False for log in failed_logs)

    def test_audit_log_repr(self, client, db):
        """Test the string representation of AuditLog."""
        log = AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=10,
        )

        repr_string = repr(log)
        assert "grant_created" in repr_string
        assert "grant:10" in repr_string


class TestAuditService:
    """Tests for the AuditService."""

    def test_log_application_submitted(self, client, db, test_user):
        """Test logging an application submission."""
        with client.application.test_request_context():
            log = AuditService.log_application_submitted(
                application_id=10,
                user_id=test_user.id,
                user_email=test_user.email,
            )

        assert log.action == "application_submitted"
        assert log.entity_type == "application"
        assert log.entity_id == 10
        assert log.is_admin is False
        assert log.success is True
        assert "submitted and locked" in log.details

    def test_log_edit_blocked(self, client, db, test_user):
        """Test logging a blocked edit attempt."""
        attempted_changes = {"funding_amount": 9999}

        with client.application.test_request_context():
            log = AuditService.log_edit_blocked(
                application_id=10,
                user_id=test_user.id,
                user_email=test_user.email,
                attempted_changes=attempted_changes,
            )

        assert log.action == "application_edit_blocked"
        assert log.success is False
        assert log.failure_reason == "Application is submitted and locked"
        assert "funding_amount" in log.details

    def test_log_admin_edit(self, client, db, admin_user):
        """Test logging an admin edit."""
        changes = {"status": "approved", "notes": "Reviewed and approved"}

        with client.application.test_request_context():
            log = AuditService.log_admin_edit(
                application_id=10,
                admin_user_id=admin_user.id,
                admin_email=admin_user.email,
                changes=changes,
            )

        assert log.action == "application_edited"
        assert log.is_admin is True
        assert log.success is True
        assert "Admin edited" in log.details
        assert "approved" in log.details

    def test_log_grant_created(self, client, db, admin_user):
        """Test logging grant creation."""
        with client.application.test_request_context():
            log = AuditService.log_grant_created(
                grant_id=1,
                user_id=admin_user.id,
                user_email=admin_user.email,
                is_admin=True,
                grant_name="Teto Grant",
            )

        assert log.action == "grant_created"
        assert log.entity_type == "grant"
        assert "Teto Grant" in log.details

    def test_log_grant_edited(self, client, db, admin_user):
        """Test logging grant edit."""
        changes = {"deadline": "2025-12-31"}

        with client.application.test_request_context():
            log = AuditService.log_grant_edited(
                grant_id=1,
                user_id=admin_user.id,
                user_email=admin_user.email,
                is_admin=True,
                changes=changes,
            )

        assert log.action == "grant_edited"
        assert "deadline" in log.details

    def test_log_grant_deleted(self, client, db, admin_user):
        """Test logging grant deletion."""
        with client.application.test_request_context():
            log = AuditService.log_grant_deleted(
                grant_id=1,
                user_id=admin_user.id,
                user_email=admin_user.email,
                is_admin=True,
                grant_name="Old Grant",
            )

        assert log.action == "grant_deleted"
        assert "Old Grant" in log.details

    def test_log_application_created(self, client, db, test_user):
        """Test logging application creation."""
        with client.application.test_request_context():
            log = AuditService.log_application_created(
                application_id=1,
                user_id=test_user.id,
                user_email=test_user.email,
                details={"grant_type": "Teto Grant"},
            )

        assert log.action == "application_created"
        assert log.entity_type == "application"
        assert "Teto Grant" in log.details


class TestAuditApiEndpoints:
    """Tests for audit API endpoints."""

    def test_get_audit_logs_requires_admin(self, client, db, test_user):
        """Test that non-admin users cannot access audit logs."""
        # Login as regular user
        login_user(client, "audituser@test.com", "password123")

        response = client.get("/api/v1/audit")

        assert response.status_code == 403

    def test_get_audit_logs_as_admin(self, client, db, admin_user):
        """Test that admin users can access audit logs."""
        # Create some logs first
        AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=1,
        )

        # Login as admin
        login_user(client, "admin@test.com", "password123")

        response = client.get("/api/v1/audit")

        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert "items" in data
        assert "count" in data

    def test_get_failed_attempts_as_admin(self, client, db, admin_user):
        """Test retrieving failed attempts via API."""
        # Create a failed log
        AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=1,
            success=False,
        )

        login_user(client, "admin@test.com", "password123")

        response = client.get("/api/v1/audit/failed")

        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] >= 1

    def test_get_entity_audit_logs(self, client, db, admin_user):
        """Test retrieving logs for a specific entity."""
        # Create logs for specific entity
        AuditLog.log(
            action=AuditAction.APPLICATION_CREATED.value,
            entity_type="application",
            entity_id=42,
        )
        AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=42,
        )

        login_user(client, "admin@test.com", "password123")

        response = client.get("/api/v1/audit/entity/application/42")

        assert response.status_code == 200
        data = response.get_json()
        assert data["entity_type"] == "application"
        assert data["entity_id"] == 42
        assert data["count"] == 2

    def test_audit_logs_unauthorized(self, client, db):
        """Test that unauthenticated users cannot access audit logs."""
        response = client.get("/api/v1/audit")

        assert response.status_code == 401