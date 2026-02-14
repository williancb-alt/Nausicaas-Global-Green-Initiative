"""merge award and application heads

Revision ID: b5c3a2d8e4f6
Revises: 7a6820d1f939, a1d4db6f91a7
Create Date: 2026-02-11 20:10:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b5c3a2d8e4f6"
down_revision = ("7a6820d1f939", "a1d4db6f91a7")
branch_labels = None
depends_on = None


def upgrade():
    # Merge migration - no changes needed
    pass


def downgrade():
    # Merge migration - no changes needed
    pass
