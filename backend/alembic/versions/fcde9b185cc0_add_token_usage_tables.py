"""add token usage tables"""

revision = 'fcde9b185cc0'
down_revision = '20260314_0001'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.create_table('token_usage_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=False),
        sa.Column('request_type', sa.Enum('CHAT', 'SUMMARY', name='token_request_type'), nullable=False),
        sa.Column('tokens_used', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.project_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_token_usage_logs_created_at', 'token_usage_logs', ['created_at'], unique=False)
    op.create_index('ix_token_usage_logs_project_id', 'token_usage_logs', ['project_id'], unique=False)
    op.create_index('ix_token_usage_logs_user_id', 'token_usage_logs', ['user_id'], unique=False)
    
    op.create_table('user_project_tokens',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=False),
        sa.Column('total_tokens_used', sa.Integer(), nullable=False),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.project_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'project_id', name='uq_user_project_tokens')
    )
    op.create_index('ix_user_project_tokens_project_id', 'user_project_tokens', ['project_id'], unique=False)
    op.create_index('ix_user_project_tokens_user_id', 'user_project_tokens', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_user_project_tokens_user_id', table_name='user_project_tokens')
    op.drop_index('ix_user_project_tokens_project_id', table_name='user_project_tokens')
    op.drop_table('user_project_tokens')
    op.drop_index('ix_token_usage_logs_user_id', table_name='token_usage_logs')
    op.drop_index('ix_token_usage_logs_project_id', table_name='token_usage_logs')
    op.drop_index('ix_token_usage_logs_created_at', table_name='token_usage_logs')
    op.drop_table('token_usage_logs')
