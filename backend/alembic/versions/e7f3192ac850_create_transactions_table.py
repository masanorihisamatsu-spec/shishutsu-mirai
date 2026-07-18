"""create transactions table

Revision ID: e7f3192ac850
Revises:
Create Date: 2026-07-16 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e7f3192ac850"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("store_name", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("payment_method", sa.String(length=50), nullable=False),
        sa.Column("memo", sa.String(length=1000), nullable=True),
        sa.Column("receipt_image", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transactions_date"), "transactions", ["date"], unique=False)
    op.create_index(op.f("ix_transactions_category"), "transactions", ["category"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_transactions_category"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_date"), table_name="transactions")
    op.drop_table("transactions")
