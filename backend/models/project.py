import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_user_id", "user_id"),
        Index("ix_projects_created_at", "created_at"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    project_slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    dataset_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    dataset_file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notebook_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="projects", lazy="selectin")
    datasets: Mapped[list["Dataset"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
    notebooks: Mapped[list["Notebook"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
