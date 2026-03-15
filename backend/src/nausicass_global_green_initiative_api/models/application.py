from datetime import timezone
from typing import Optional

from sqlalchemy.ext.hybrid import hybrid_property

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.util.datetime_util import (
    get_local_utcoffset,
    localized_dt_string,
    make_tzaware,
    utc_now,
)


class Application(db.Model):
    """Application model for grant applications."""

    __tablename__ = "application"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    submitted_at = db.Column(db.DateTime, default=utc_now)
    status = db.Column(
        db.String(20),
        default="pending_review",
        nullable=False,
    )  # pending_review, in_review, approved, denied
    field_values = db.Column(db.JSON, nullable=True)
    feedback = db.Column(db.String(1000), nullable=True)

    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    grant_id = db.Column(db.Integer, db.ForeignKey("grant.id"), nullable=False)

    # Relationships
    user = db.relationship("User", backref=db.backref("applications"))
    grant = db.relationship("Grant", backref=db.backref("applications"))

    def __repr__(self) -> str:
        return (
            f"<Application id={self.id}, "
            f"user_id={self.user_id}, grant_id={self.grant_id}>"
        )

    @hybrid_property
    def submitted_at_str(self) -> str:
        submitted_at_utc = make_tzaware(
            self.submitted_at, use_tz=timezone.utc, localize=False
        )
        return localized_dt_string(submitted_at_utc, use_tz=get_local_utcoffset())

    @hybrid_property
    def submitted_date(self) -> str:
        """Return date in YYYY-MM-DD format."""
        return self.submitted_at.strftime("%Y-%m-%d")

    @classmethod
    def find_by_id(cls, application_id: int) -> Optional["Application"]:
        return cls.query.filter_by(id=application_id).first()

    @classmethod
    def find_by_user_id(cls, user_id: int) -> list["Application"]:
        return cls.query.filter_by(user_id=user_id).all()

    @classmethod
    def find_by_grant_id(cls, grant_id: int) -> list["Application"]:
        return cls.query.filter_by(grant_id=grant_id).all()

    @classmethod
    def find_by_user_and_grant(
        cls, user_id: int, grant_id: int
    ) -> Optional["Application"]:
        return cls.query.filter_by(user_id=user_id, grant_id=grant_id).first()
