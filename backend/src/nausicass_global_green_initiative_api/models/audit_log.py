"""AuditLog model for tracking all system changes and access attempts."""

from enum import Enum
from typing import Optional

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.util.datetime_util import utc_now


class AuditAction(str, Enum):
    """Enum for audit log action types."""

    # Application-related actions
    APPLICATION_CREATED = "application_created"
    APPLICATION_SUBMITTED = "application_submitted"
    APPLICATION_EDIT_BLOCKED = "application_edit_blocked"
    APPLICATION_EDITED = "application_edited"
    APPLICATION_DELETED = "application_deleted"

    # Grant-related actions
    GRANT_CREATED = "grant_created"
    GRANT_EDITED = "grant_edited"
    GRANT_DELETED = "grant_deleted"


class AuditLog(db.Model):
    """AuditLog model for tracking all system changes and access attempts."""

    __tablename__ = "audit_log"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp = db.Column(db.DateTime, default=utc_now, nullable=False, index=True)

    # Who performed the action
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    user = db.relationship("User", backref=db.backref("audit_logs", lazy="dynamic"))
    user_email = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)

    # What action was performed
    action = db.Column(db.String(50), nullable=False, index=True)

    # What entity was affected
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)

    # Additional context
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)

    # Outcome
    success = db.Column(db.Boolean, default=True, nullable=False)
    failure_reason = db.Column(db.String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity_type}:{self.entity_id}>"

    @classmethod
    def log(
        cls,
        action: str,
        entity_type: str,
        entity_id: int,
        user_id: Optional[int] = None,
        user_email: Optional[str] = None,
        is_admin: bool = False,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        failure_reason: Optional[str] = None,
    ) -> "AuditLog":
        """Create and persist an audit log entry."""
        entry = cls(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            user_email=user_email,
            is_admin=is_admin,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason,
        )
        db.session.add(entry)
        db.session.commit()
        return entry

    @classmethod
    def get_logs_for_entity(cls, entity_type: str, entity_id: int) -> list["AuditLog"]:
        """Retrieve all audit logs for a specific entity."""
        return (
            cls.query.filter_by(entity_type=entity_type, entity_id=entity_id)
            .order_by(cls.timestamp.desc())
            .all()
        )

    @classmethod
    def get_recent_logs(cls, limit: int = 100) -> list["AuditLog"]:
        """Retrieve most recent audit logs."""
        return cls.query.order_by(cls.timestamp.desc()).limit(limit).all()

    @classmethod
    def get_failed_attempts(cls, limit: int = 100) -> list["AuditLog"]:
        """Retrieve recent failed action attempts."""
        return (
            cls.query.filter_by(success=False)
            .order_by(cls.timestamp.desc())
            .limit(limit)
            .all()
        )
