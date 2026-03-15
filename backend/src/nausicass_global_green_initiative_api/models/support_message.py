from typing import Optional
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import timezone

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.util.datetime_util import (
    utc_now,
    get_local_utcoffset,
    localized_dt_string,
    make_tzaware,
)


class SupportMessage(db.Model):
    """Support Message model REST API."""

    __tablename__ = "support_message"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default="Open")  # Open, Resolved
    created_at = db.Column(db.DateTime, default=utc_now)
    
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref=db.backref("support_messages"))
    
    application_id = db.Column(db.Integer, db.ForeignKey("application.id"), nullable=False)
    application = db.relationship("Application", backref=db.backref("support_messages"))

    def __repr__(self) -> str:
        return f"<SupportMessage id={self.id} subject={self.subject}>"

    @hybrid_property
    def created_at_str(self) -> str:
        created_at_utc = make_tzaware(
            self.created_at, use_tz=timezone.utc, localize=False
        )
        return localized_dt_string(created_at_utc, use_tz=get_local_utcoffset())

    @classmethod
    def get_all(cls) -> list["SupportMessage"]:
        return cls.query.order_by(cls.created_at.desc()).all()
