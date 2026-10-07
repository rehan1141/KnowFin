"""add_accounts_recurring_and_enhancements

Revision ID: ccd845584d95
Revises: de559572e69e
Create Date: 2026-10-08 00:49:26.052794

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ccd845584d95'
down_revision: Union[str, Sequence[str], None] = 'de559572e69e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('account_type', sa.String(length=50), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='EUR'),
        sa.Column('initial_balance', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_accounts_id'), 'accounts', ['id'], unique=False)
    op.create_index(op.f('ix_accounts_user_id'), 'accounts', ['user_id'], unique=False)

    op.create_table('recurring_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('transaction_type', sa.String(length=20), nullable=False, server_default='expense'),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('frequency', sa.String(length=20), nullable=False, server_default='monthly'),
        sa.Column('start_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('day_of_month', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recurring_transactions_account_id'), 'recurring_transactions', ['account_id'], unique=False)
    op.create_index(op.f('ix_recurring_transactions_category_id'), 'recurring_transactions', ['category_id'], unique=False)
    op.create_index(op.f('ix_recurring_transactions_id'), 'recurring_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_recurring_transactions_user_id'), 'recurring_transactions', ['user_id'], unique=False)

    op.add_column('categories', sa.Column('category_type', sa.String(length=20), nullable=False, server_default='expense'))
    op.add_column('categories', sa.Column('icon', sa.String(length=50), nullable=False, server_default='Folder'))
    op.add_column('categories', sa.Column('color', sa.String(length=30), nullable=False, server_default='#1F6B50'))
    op.add_column('categories', sa.Column('parent_id', sa.Integer(), nullable=True))
    op.add_column('categories', sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'))
    
    op.drop_constraint('uq_category_name_user', 'categories', type_='unique')
    op.create_index(op.f('ix_categories_parent_id'), 'categories', ['parent_id'], unique=False)
    op.create_unique_constraint('uq_category_name_user_parent', 'categories', ['name', 'user_id', 'parent_id'])
    op.create_foreign_key(None, 'categories', 'categories', ['parent_id'], ['id'], ondelete='SET NULL')

    op.add_column('expenses', sa.Column('transaction_type', sa.String(length=20), nullable=False, server_default='expense'))
    op.add_column('expenses', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('expenses', sa.Column('subcategory_id', sa.Integer(), nullable=True))
    op.add_column('expenses', sa.Column('account_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_expenses_account_id'), 'expenses', ['account_id'], unique=False)
    op.create_index(op.f('ix_expenses_subcategory_id'), 'expenses', ['subcategory_id'], unique=False)
    op.create_index(op.f('ix_expenses_transaction_type'), 'expenses', ['transaction_type'], unique=False)
    op.create_foreign_key(None, 'expenses', 'accounts', ['account_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key(None, 'expenses', 'categories', ['subcategory_id'], ['id'], ondelete='SET NULL')

    op.add_column('users', sa.Column('default_currency', sa.String(length=3), nullable=False, server_default='EUR'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'default_currency')
    op.drop_constraint(None, 'expenses', type_='foreignkey')
    op.drop_constraint(None, 'expenses', type_='foreignkey')
    op.drop_index(op.f('ix_expenses_transaction_type'), table_name='expenses')
    op.drop_index(op.f('ix_expenses_subcategory_id'), table_name='expenses')
    op.drop_index(op.f('ix_expenses_account_id'), table_name='expenses')
    op.drop_column('expenses', 'account_id')
    op.drop_column('expenses', 'subcategory_id')
    op.drop_column('expenses', 'notes')
    op.drop_column('expenses', 'transaction_type')
    op.drop_constraint(None, 'categories', type_='foreignkey')
    op.drop_constraint('uq_category_name_user_parent', 'categories', type_='unique')
    op.drop_index(op.f('ix_categories_parent_id'), table_name='categories')
    op.create_unique_constraint('uq_category_name_user', 'categories', ['name', 'user_id'])
    op.drop_column('categories', 'is_default')
    op.drop_column('categories', 'parent_id')
    op.drop_column('categories', 'color')
    op.drop_column('categories', 'icon')
    op.drop_column('categories', 'category_type')
    op.drop_index(op.f('ix_recurring_transactions_user_id'), table_name='recurring_transactions')
    op.drop_index(op.f('ix_recurring_transactions_id'), table_name='recurring_transactions')
    op.drop_index(op.f('ix_recurring_transactions_category_id'), table_name='recurring_transactions')
    op.drop_index(op.f('ix_recurring_transactions_account_id'), table_name='recurring_transactions')
    op.drop_table('recurring_transactions')
    op.drop_index(op.f('ix_accounts_user_id'), table_name='accounts')
    op.drop_index(op.f('ix_accounts_id'), table_name='accounts')
    op.drop_table('accounts')
