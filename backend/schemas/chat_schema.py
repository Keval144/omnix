from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.chat import ChatRole


class ChatMessageCreate(BaseModel):
    project_id: UUID
    content: str = Field(min_length=1)
    session_id: UUID | None = None


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message_id: UUID
    session_id: UUID
    role: ChatRole
    content: str
    created_at: datetime


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: UUID
    project_id: UUID
    created_at: datetime


class ChatMessagePage(BaseModel):
    items: list[ChatMessageResponse]
    next_cursor: UUID | None
    has_more: bool
