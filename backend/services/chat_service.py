from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from constants import MAX_CHAT_PAGE_SIZE
from models.chat import ChatMessage, ChatRole, ChatSession
from models.project import Project
from services.project_service import ProjectService


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_service = ProjectService(session)

    async def create_message(self, project_id: UUID, user_id: str, content: str, session_id: UUID | None) -> tuple[ChatSession, ChatMessage, ChatMessage]:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        chat_session = await self._get_or_create_session(project.project_id, session_id)
        user_message = ChatMessage(session_id=chat_session.session_id, role=ChatRole.USER, content=content)
        assistant_message = ChatMessage(
            session_id=chat_session.session_id,
            role=ChatRole.ASSISTANT,
            content=self._build_stub_response(content),
        )
        self.session.add_all([user_message, assistant_message])
        await self.session.commit()
        await self.session.refresh(chat_session)
        await self.session.refresh(user_message)
        await self.session.refresh(assistant_message)
        return chat_session, user_message, assistant_message

    async def get_messages(self, session_id: UUID, user_id: str, limit: int, cursor: UUID | None) -> tuple[list[ChatMessage], UUID | None, bool]:
        page_size = max(1, min(limit, MAX_CHAT_PAGE_SIZE))
        session = await self.session.scalar(
            select(ChatSession).join(ChatSession.project).where(ChatSession.session_id == session_id, Project.user_id == user_id)
        )
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

        stmt: Select[tuple[ChatMessage]] = select(ChatMessage).where(ChatMessage.session_id == session_id)

        if cursor:
            cursor_message = await self.session.scalar(select(ChatMessage).where(ChatMessage.message_id == cursor))
            if cursor_message:
                stmt = stmt.where(ChatMessage.created_at < cursor_message.created_at)

        stmt = stmt.order_by(ChatMessage.created_at.desc(), ChatMessage.message_id.desc()).limit(page_size + 1)
        rows = list((await self.session.scalars(stmt)).all())

        has_more = len(rows) > page_size
        items = rows[:page_size]
        next_cursor = items[-1].message_id if has_more and items else None
        return items, next_cursor, has_more

    async def _get_or_create_session(self, project_id: UUID, session_id: UUID | None) -> ChatSession:
        if session_id:
            session = await self.session.scalar(select(ChatSession).where(ChatSession.session_id == session_id))
            if not session:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
            return session

        session = ChatSession(project_id=project_id)
        self.session.add(session)
        await self.session.flush()
        return session

    @staticmethod
    def _build_stub_response(prompt: str) -> str:
        return f"Dataset-aware assistant response placeholder for: {prompt}"
