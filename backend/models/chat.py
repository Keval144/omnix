import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Index, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class ChatRole(str, Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (
        Index("ix_chat_sessions_project_id", "project_id"),
        Index("ix_chat_sessions_created_at", "created_at"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship(back_populates="chat_sessions", lazy="selectin")
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", lazy="selectin", order_by="desc(ChatMessage.created_at)"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        Index("ix_chat_messages_session_id", "session_id"),
        Index("ix_chat_messages_created_at", "created_at"),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_sessions.session_id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[ChatRole] = mapped_column(SqlEnum(ChatRole, name="chat_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session: Mapped[ChatSession] = relationship(back_populates="messages", lazy="selectin")
