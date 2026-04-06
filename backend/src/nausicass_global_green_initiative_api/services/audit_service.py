"""Audit service for creating audit log entries."""

import json
from typing import Any, Optional

from flask import has_request_context, request

from nausicass_global_green_initiative_api.models.audit_log import AuditAction, AuditLog


class AuditService:
    """Service class for creating audit log entries."""

    @staticmethod
    def _get_request_context() -> tuple[Optional[str], Optional[str]]:
        """Extract IP address and user agent from Flask request context."""
        if has_request_context():
            ip_address = request.remote_addr
            user_agent = request.headers.get("User-Agent", "")[:500]
            return ip_address, user_agent
        return None, None

    @staticmethod
    def _serialize_details(details: Any) -> Optional[str]:
        """Convert details dict to JSON string."""
        if details is None:
            return None
        if isinstance(details, str):
            return details
        return json.dumps(details, default=str)

    @classmethod
    def log_application_created(
        cls,
        application_id: int,
        user_id: int,
        user_email: str,
        details: Optional[dict] = None,
    ) -> AuditLog:
        """Log when an application is created."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.APPLICATION_CREATED.value,
            entity_type="application",
            entity_id=application_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=False,
            details=cls._serialize_details(details or {"event": "Application created"}),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_application_submitted(
        cls,
        application_id: int,
        user_id: int,
        user_email: str,
    ) -> AuditLog:
        """Log when an application is submitted and locked."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.APPLICATION_SUBMITTED.value,
            entity_type="application",
            entity_id=application_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=False,
            details=cls._serialize_details(
                {"event": "Application submitted and locked"}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_edit_blocked(
        cls,
        application_id: int,
        user_id: int,
        user_email: str,
        attempted_changes: Optional[dict] = None,
    ) -> AuditLog:
        """Log when a non-admin user attempts to edit a submitted application."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.APPLICATION_EDIT_BLOCKED.value,
            entity_type="application",
            entity_id=application_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=False,
            details=cls._serialize_details(
                {
                    "event": "Edit attempt blocked - application already submitted",
                    "attempted_changes": attempted_changes,
                }
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            failure_reason="Application is submitted and locked",
        )

    @classmethod
    def log_admin_edit(
        cls,
        application_id: int,
        admin_user_id: int,
        admin_email: str,
        changes: dict,
    ) -> AuditLog:
        """Log when an admin successfully edits a submitted application."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.APPLICATION_EDITED.value,
            entity_type="application",
            entity_id=application_id,
            user_id=admin_user_id,
            user_email=admin_email,
            is_admin=True,
            details=cls._serialize_details(
                {
                    "event": "Admin edited submitted application",
                    "changes": changes,
                }
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_application_deleted(
        cls,
        application_id: int,
        admin_user_id: int,
        admin_email: str,
    ) -> AuditLog:
        """Log when an admin deletes an application."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.APPLICATION_DELETED.value,
            entity_type="application",
            entity_id=application_id,
            user_id=admin_user_id,
            user_email=admin_email,
            is_admin=True,
            details=cls._serialize_details({"event": "Application deleted by admin"}),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_login_failed(
        cls,
        email: str,
        reason: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log a failed login attempt."""
        req_ip, req_ua = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.LOGIN_FAILED.value,
            entity_type="user",
            entity_id=0,
            user_id=None,
            user_email=email,
            is_admin=False,
            details=cls._serialize_details(
                {"event": "Login attempt failed", "reason": reason}
            ),
            ip_address=ip_address or req_ip,
            user_agent=user_agent or req_ua,
            success=False,
            failure_reason=reason,
        )

    @classmethod
    def log_unauthorized_access(
        cls,
        user_id: Optional[int],
        user_email: Optional[str],
        attempted_endpoint: str,
    ) -> AuditLog:
        """Log an unauthorized access attempt to an admin endpoint."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.UNAUTHORIZED_ACCESS.value,
            entity_type="system",
            entity_id=0,
            user_id=user_id,
            user_email=user_email,
            is_admin=False,
            details=cls._serialize_details(
                {
                    "event": "Unauthorized access attempt",
                    "attempted_endpoint": attempted_endpoint,
                }
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=False,
            failure_reason="Admin privileges required",
        )

    @classmethod
    def log_grant_created(
        cls,
        grant_id: int,
        user_id: int,
        user_email: str,
        is_admin: bool,
        grant_name: str,
    ) -> AuditLog:
        """Log when a grant is created."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.GRANT_CREATED.value,
            entity_type="grant",
            entity_id=grant_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=cls._serialize_details(
                {"event": "Grant created", "grant_name": grant_name}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_grant_edited(
        cls,
        grant_id: int,
        user_id: int,
        user_email: str,
        is_admin: bool,
        changes: dict,
    ) -> AuditLog:
        """Log when a grant is edited."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.GRANT_EDITED.value,
            entity_type="grant",
            entity_id=grant_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=cls._serialize_details(
                {"event": "Grant edited", "changes": changes}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_grant_deleted(
        cls,
        grant_id: int,
        user_id: int,
        user_email: str,
        is_admin: bool,
        grant_name: str,
    ) -> AuditLog:
        """Log when a grant is deleted."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.GRANT_DELETED.value,
            entity_type="grant",
            entity_id=grant_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=cls._serialize_details(
                {"event": "Grant deleted", "grant_name": grant_name}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_award_created(
        cls,
        award_id: int,
        user_id: int,
        user_email: str,
        is_admin: bool,
        award_name: str,
    ) -> AuditLog:
        """Log when an award is created."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.AWARD_CREATED.value,
            entity_type="award",
            entity_id=award_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=cls._serialize_details(
                {"event": "Award created", "award_name": award_name}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_award_edited(
        cls,
        award_id: int,
        user_id: int,
        user_email: str,
        is_admin: bool,
        changes: dict,
    ) -> AuditLog:
        """Log when an award is edited."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.AWARD_EDITED.value,
            entity_type="award",
            entity_id=award_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=cls._serialize_details(
                {"event": "Award edited", "changes": changes}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    @classmethod
    def log_award_deleted(
        cls,
        award_id: int,
        user_id: int,
        user_email: str,
        is_admin: bool,
        award_name: str,
    ) -> AuditLog:
        """Log when an award is deleted."""
        ip_address, user_agent = cls._get_request_context()

        return AuditLog.log(
            action=AuditAction.AWARD_DELETED.value,
            entity_type="award",
            entity_id=award_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=cls._serialize_details(
                {"event": "Award deleted", "award_name": award_name}
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )
