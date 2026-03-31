"""Add dataset_file_name to projects table

Revision ID: add_dataset_file_name
Revises: 
Create Date: 2026-03-31 10:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_dataset_file_name'
down_revision = 'fcde9b185cc0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('dataset_file_name', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('projects', 'dataset_file_name')