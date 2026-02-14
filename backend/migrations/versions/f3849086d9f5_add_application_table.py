"""Add application table

Revision ID: f3849086d9f5
Revises: ce29726fd3cb
Create Date: 2026-02-06 10:54:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "f3849086d9f5"
down_revision = "ce29726fd3cb"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "application",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("field_values", sa.JSON(), nullable=True),
        sa.Column("feedback", sa.String(length=1000), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("grant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["grant_id"],
            ["grant.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("application")
