"""Unit tests for AuditLog model and AuditService."""

import pytest

from nausicass_global_green_initiative_api.models.audit_log import AuditAction, AuditLog
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.audit_service import AuditService
from tests.util import (
    create_award,
    delete_award,
    login_user,
    register_user,
    update_award,
    DEFAULT_DEADLINE,
)


@pytest.fixture
def test_user(client, db):
    """Create a test user for audit log tests."""
    register_user(client, "audituser@test.com", "Password123")
    user = User.find_by_email("audituser@test.com")
    return user


@pytest.fixture
def admin_user(client, db):
    """Create an admin user for audit log tests."""
    register_user(client, "admin@test.com", "Password123")
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


class TestAuditServiceNewMethods:
    """Tests for new AuditService methods added in the audit logging expansion."""

    def test_log_application_created(self, client, db, test_user):
        """Test logging an application creation via service."""
        with client.application.test_request_context():
            log = AuditService.log_application_created(
                application_id=20,
                user_id=test_user.id,
                user_email=test_user.email,
                details={"grant_name": "Green Future"},
            )

        assert log.action == "application_created"
        assert log.entity_type == "application"
        assert log.entity_id == 20
        assert log.success is True
        assert log.is_admin is False

    def test_log_application_deleted(self, client, db, admin_user):
        """Test logging an application deletion by admin via service."""
        with client.application.test_request_context():
            log = AuditService.log_application_deleted(
                application_id=30,
                admin_user_id=admin_user.id,
                admin_email=admin_user.email,
            )

        assert log.action == "application_deleted"
        assert log.entity_id == 30
        assert log.is_admin is True
        assert log.success is True

    def test_log_login_failed(self, client, db):
        """Test logging a failed login attempt via service."""
        with client.application.test_request_context():
            log = AuditService.log_login_failed(
                email="hacker@bad.com",
                reason="Incorrect password",
            )

        assert log.action == "login_failed"
        assert log.user_email == "hacker@bad.com"
        assert log.success is False
        assert log.failure_reason == "Incorrect password"

    def test_log_unauthorized_access(self, client, db, test_user):
        """Test logging an unauthorized access attempt via service."""
        with client.application.test_request_context():
            log = AuditService.log_unauthorized_access(
                user_id=test_user.id,
                user_email=test_user.email,
                attempted_endpoint="/api/v1/audit",
            )

        assert log.action == "unauthorized_access"
        assert log.success is False
        assert log.failure_reason == "Admin privileges required"

    def test_log_award_created(self, client, db, admin_user):
        """Test logging an award creation via service."""
        with client.application.test_request_context():
            log = AuditService.log_award_created(
                award_id=5,
                user_id=admin_user.id,
                user_email=admin_user.email,
                is_admin=True,
                award_name="Excellence Award",
            )

        assert log.action == "award_created"
        assert log.entity_type == "award"
        assert log.entity_id == 5
        assert log.is_admin is True

    def test_log_award_edited(self, client, db, admin_user):
        """Test logging an award edit via service."""
        with client.application.test_request_context():
            log = AuditService.log_award_edited(
                award_id=5,
                user_id=admin_user.id,
                user_email=admin_user.email,
                is_admin=True,
                changes={"deadline": {"from": "2026-05-01", "to": "2026-06-01"}},
            )

        assert log.action == "award_edited"
        assert log.entity_type == "award"
        assert log.success is True

    def test_log_award_deleted(self, client, db, admin_user):
        """Test logging an award deletion via service."""
        with client.application.test_request_context():
            log = AuditService.log_award_deleted(
                award_id=5,
                user_id=admin_user.id,
                user_email=admin_user.email,
                is_admin=True,
                award_name="Excellence Award",
            )

        assert log.action == "award_deleted"
        assert log.entity_type == "award"
        assert log.success is True


class TestAuditLogFiltering:
    """Tests for get_filtered_logs model method."""

    def test_filter_by_action(self, client, db, test_user):
        """Only logs matching the requested action are returned."""
        AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
            user_email=test_user.email,
        )
        AuditLog.log(
            action=AuditAction.GRANT_DELETED.value,
            entity_type="grant",
            entity_id=1,
            user_email=test_user.email,
        )

        results = AuditLog.get_filtered_logs(action="grant_created")

        assert len(results) == 1
        assert results[0].action == "grant_created"

    def test_filter_by_success_false(self, client, db, test_user):
        """Only failed logs are returned when success=False is applied."""
        AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
            success=True,
        )
        AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=2,
            success=False,
        )

        results = AuditLog.get_filtered_logs(success=False)

        assert len(results) == 1
        assert results[0].success is False

    def test_filter_by_user_email(self, client, db, test_user, admin_user):
        """Only logs for the specified user email are returned."""
        AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
            user_email=test_user.email,
        )
        AuditLog.log(
            action=AuditAction.GRANT_EDITED.value,
            entity_type="grant",
            entity_id=1,
            user_email=admin_user.email,
        )

        results = AuditLog.get_filtered_logs(user_email=test_user.email)

        assert len(results) == 1
        assert results[0].user_email == test_user.email

    def test_filter_by_days(self, client, db, test_user):
        """Logs older than the days window are excluded."""
        from datetime import datetime, timedelta

        old_log = AuditLog(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
            user_email=test_user.email,
            success=True,
        )
        old_log.timestamp = datetime.utcnow() - timedelta(days=10)
        db.session.add(old_log)

        recent_log = AuditLog.log(
            action=AuditAction.GRANT_EDITED.value,
            entity_type="grant",
            entity_id=1,
            user_email=test_user.email,
        )
        db.session.commit()

        results = AuditLog.get_filtered_logs(days=7)

        ids = [r.id for r in results]
        assert recent_log.id in ids
        assert old_log.id not in ids

    def test_no_filters_returns_all(self, client, db, test_user):
        """Without filters all logs up to the limit are returned."""
        for i in range(3):
            AuditLog.log(
                action=AuditAction.GRANT_CREATED.value,
                entity_type="grant",
                entity_id=i,
                user_email=test_user.email,
            )

        results = AuditLog.get_filtered_logs()

        assert len(results) == 3


class TestAuditApiEndpoints:
    """Tests for audit API endpoints."""

    def test_get_audit_logs_requires_admin(self, client, db, test_user):
        """Test that non-admin users cannot access audit logs."""
        login_user(client, "audituser@test.com", "Password123")

        response = client.get("/api/v1/audit")

        assert response.status_code == 403

    def test_get_audit_logs_as_admin(self, client, db, admin_user):
        """Test that admin users can access audit logs."""
        AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=1,
        )

        login_user(client, "admin@test.com", "Password123")

        response = client.get("/api/v1/audit")

        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert "items" in data

    def test_filter_by_action_param(self, client, db, admin_user):
        """Endpoint returns only logs matching the action query param."""
        AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
        )
        AuditLog.log(
            action=AuditAction.GRANT_DELETED.value,
            entity_type="grant",
            entity_id=1,
        )

        login_user(client, "admin@test.com", "Password123")
        response = client.get("/api/v1/audit?action=grant_created")

        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] == 1
        assert data["items"][0]["action"] == "grant_created"

    def test_filter_by_success_false_param(self, client, db, admin_user):
        """Endpoint returns only failed logs when success=false is passed."""
        AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
            success=True,
        )
        AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=2,
            success=False,
        )

        login_user(client, "admin@test.com", "Password123")
        response = client.get("/api/v1/audit?success=false")

        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] == 1
        assert data["items"][0]["success"] is False

    def test_filter_by_user_email_param(self, client, db, admin_user):
        """Endpoint returns only logs for the specified user_email."""
        AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=1,
            user_email="admin@test.com",
        )
        AuditLog.log(
            action=AuditAction.GRANT_EDITED.value,
            entity_type="grant",
            entity_id=1,
            user_email="other@test.com",
        )

        login_user(client, "admin@test.com", "Password123")
        response = client.get("/api/v1/audit?user_email=admin@test.com")

        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] == 1
        assert data["items"][0]["user_email"] == "admin@test.com"


class TestAuditAwardHandlerIntegration:
    """Integration tests: award CRUD operations create audit log entries."""

    def test_create_award_creates_audit_log(self, client, db, admin_user):
        """Creating an award via the API produces an award_created log."""
        login_user(client, "admin@test.com", "Password123")
        create_award(client, award_name="eco-grant", deadline_str=DEFAULT_DEADLINE)

        logs = AuditLog.get_filtered_logs(action="award_created")

        assert len(logs) == 1
        assert logs[0].entity_type == "award"
        assert logs[0].is_admin is True

    def test_delete_award_creates_audit_log(self, client, db, admin_user):
        """Deleting an award via the API produces an award_deleted log."""
        login_user(client, "admin@test.com", "Password123")
        create_award(client, award_name="eco-grant", deadline_str=DEFAULT_DEADLINE)
        delete_award(client, "eco-grant")

        logs = AuditLog.get_filtered_logs(action="award_deleted")

        assert len(logs) == 1
        assert logs[0].entity_type == "award"

    def test_update_award_creates_audit_log(self, client, db, admin_user):
        """Updating an existing award via the API produces an award_edited log."""
        login_user(client, "admin@test.com", "Password123")
        create_award(client, award_name="eco-grant", deadline_str=DEFAULT_DEADLINE)
        update_award(client, "eco-grant", deadline_str=DEFAULT_DEADLINE)

        logs = AuditLog.get_filtered_logs(action="award_edited")

        assert len(logs) == 1
        assert logs[0].entity_type == "award"


class TestAuditLoginFailureIntegration:
    """Integration tests: failed logins create login_failed audit log entries."""

    def test_wrong_password_creates_login_failed_log(self, client, db):
        """A login attempt with a wrong password creates a login_failed entry."""
        register_user(client, "victim@test.com", "Password123")

        client.post(
            "/api/v1/auth/login",
            data="email=victim@test.com&password=WrongPassword1",
            content_type="application/x-www-form-urlencoded",
        )

        logs = AuditLog.get_filtered_logs(action="login_failed")

        assert len(logs) == 1
        assert logs[0].user_email == "victim@test.com"
        assert logs[0].success is False

    def test_unknown_email_creates_login_failed_log(self, client, db):
        """A login attempt with an unregistered email creates a login_failed entry."""
        client.post(
            "/api/v1/auth/login",
            data="email=ghost@test.com&password=Password123",
            content_type="application/x-www-form-urlencoded",
        )

        logs = AuditLog.get_filtered_logs(action="login_failed")

        assert len(logs) == 1
        assert logs[0].user_email == "ghost@test.com"
