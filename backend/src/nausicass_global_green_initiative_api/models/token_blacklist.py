from datetime import timezone

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.util.datetime_util import (
    utc_now,
    dtaware_fromtimestamp,
)


class BlacklistedToken(db.Model):
    """BlacklistedToken Model for storing JWT tokens."""

    __tablename__ = "token_blacklist"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    token = db.Column(db.String(500), unique=True, nullable=False)
    blacklisted_on = db.Column(db.DateTime, default=utc_now)
    expires_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, token: str, expires_at: int) -> None:
        self.token = token
        self.expires_at = dtaware_fromtimestamp(expires_at, use_tz=timezone.utc)

    def __repr__(self) -> str:
        return f"<BlacklistToken token={self.token}>"

    @classmethod
    def check_blacklist(cls, token: str) -> bool:
        exists = cls.query.filter_by(token=token).first()
        return True if exists else False
