"""allow_nullable_opening_balance

Revision ID: e1f8a2b3c4d5
Revises: ccd845584d95
Create Date: 2026-10-13 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e1f8a2b3c4d5'
down_revision: Union[str, Sequence[str], None] = 'ccd845584d95'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('accounts', 'initial_balance',
               existing_type=sa.Numeric(precision=12, scale=2),
               nullable=True,
               server_default=None)


def downgrade() -> None:
    op.alter_column('accounts', 'initial_balance',
               existing_type=sa.Numeric(precision=12, scale=2),
               nullable=False,
               server_default='0.00')
