from typing import Optional

from nausicass_global_green_initiative_api import db


class UserOAuthAccount(db.Model):
    """Links a user to an OAuth provider identity. One user - multiple providers."""

    __tablename__ = "user_oauth_account"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    provider = db.Column(db.String(50), nullable=False)
    provider_id = db.Column(db.String(255), nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            "provider", "provider_id", name="uq_user_oauth_account_provider_provider_id"
        ),
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "oauth_accounts", lazy="dynamic", cascade="all, delete-orphan"
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<UserOAuthAccount id={self.id}, user_id={self.user_id}, "
            f"provider={self.provider}>"
        )

    @classmethod
    def find_by_provider(
        cls, provider: str, provider_id: str
    ) -> Optional["UserOAuthAccount"]:
        return cls.query.filter_by(provider=provider, provider_id=provider_id).first()
