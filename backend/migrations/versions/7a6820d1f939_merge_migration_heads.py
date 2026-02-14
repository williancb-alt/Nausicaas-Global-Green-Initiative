"""merge migration heads

Revision ID: 7a6820d1f939
Revises: 0fa7ae96b8b3, f3849086d9f5
Create Date: 2026-02-11 19:45:00.000000

"""

from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

# revision identifiers, used by Alembic.
revision = "7a6820d1f939"
down_revision = ("0fa7ae96b8b3", "f3849086d9f5")
branch_labels = None
depends_on = None


def upgrade():
    # Merge migration - no changes needed
    pass


def downgrade():
    # Merge migration - no changes needed
    pass
