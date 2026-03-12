import hashlib
import secrets
from datetime import timedelta, timezone

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.util.datetime_util import utc_now

RESET_TOKEN_EXPIRE_MINUTES = 15


class PasswordResetToken(db.Model):
    """Model for storing password reset tokens."""

    __tablename__ = "password_reset_token"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    token_hash = db.Column(db.String(64), nullable=False)
    created_on = db.Column(db.DateTime, default=utc_now)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

    user = db.relationship("User", backref="password_reset_tokens")

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @classmethod
    def create(cls, user_id: int) -> tuple["PasswordResetToken", str]:
        """Create a new reset token. Returns (model instance, raw_token)."""
        # Invalidate any existing unused tokens for this user
        cls.query.filter_by(user_id=user_id, used=False).update({"used": True})

        raw_token = secrets.token_urlsafe(32)
        now = utc_now()
        token = cls(
            user_id=user_id,
            token_hash=cls.hash_token(raw_token),
            expires_at=now + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
        )
        db.session.add(token)
        return token, raw_token

    @classmethod
    def find_valid_token(cls, raw_token: str):
        """Find a valid (not expired, not used) token by its raw value."""
        token_hash = cls.hash_token(raw_token)
        now = utc_now()
        return cls.query.filter(
            cls.token_hash == token_hash,
            cls.used == False,  # noqa: E712
            cls.expires_at > now,
        ).first()
