import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class TokenRequestType(str, Enum):
    CHAT = "CHAT"
    SUMMARY = "SUMMARY"


class UserProjectToken(Base):
    __tablename__ = "user_project_tokens"
    __table_args__ = (
        Index("ix_user_project_tokens_user_id", "user_id"),
        Index("ix_user_project_tokens_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False
    )
    total_tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TokenUsageLog(Base):
    __tablename__ = "token_usage_logs"
    __table_args__ = (
        Index("ix_token_usage_logs_user_id", "user_id"),
        Index("ix_token_usage_logs_project_id", "project_id"),
        Index("ix_token_usage_logs_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False
    )
    request_type: Mapped[TokenRequestType] = mapped_column(SqlEnum(TokenRequestType, name="token_request_type"), nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
