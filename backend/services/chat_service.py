import logging
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from constants import MAX_CHAT_PAGE_SIZE
from llm.iflow_client import generate_async
from models.chat import ChatMessage, ChatRole, ChatSession
from models.dataset import Dataset
from models.project import Project
from prompts.chat_prompts import build_chat_prompt
from services.project_service import ProjectService

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_service = ProjectService(session)

    async def create_message(self, project_id: UUID, user_id: str, content: str, session_id: UUID | None) -> tuple[ChatSession, ChatMessage, ChatMessage]:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        chat_session = await self._get_or_create_session(project.project_id, session_id)
        
        dataset_task = self._get_dataset_context(project.project_id)
        
        user_message = ChatMessage(session_id=chat_session.session_id, role=ChatRole.USER, content=content)
        self.session.add(user_message)
        await self.session.flush()
        
        dataset_context, response_content = await self._get_dataset_context_and_generate(
            project.project_id, content
        )
        
        assistant_message = ChatMessage(
            session_id=chat_session.session_id,
            role=ChatRole.ASSISTANT,
            content=response_content,
        )
        self.session.add(assistant_message)
        await self.session.commit()
        return chat_session, user_message, assistant_message

    async def _get_dataset_context_and_generate(self, project_id: UUID, content: str) -> tuple[Dataset | None, str]:
        dataset = await self._get_dataset_context(project_id)
        response = await self._generate_response(content, dataset)
        return dataset, response

    async def _get_dataset_context(self, project_id: UUID) -> Dataset | None:
        return await self.session.scalar(select(Dataset).where(Dataset.project_id == project_id))

    async def _generate_response(self, prompt: str, dataset: Dataset | None) -> str:
        try:
            context = None
            if dataset and dataset.summary:
                context = self._build_context_from_dataset(dataset)
            
            full_prompt, system_prompt = build_chat_prompt(prompt, context)
            return await generate_async(full_prompt, system_prompt)
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="LLM request failed. Check IFLOW_API_KEY, IFLOW_API_URL, and outbound network access.",
            ) from e

    def _build_context_from_dataset(self, dataset: Dataset) -> str:
        summary = dataset.summary or {}
        context_parts = [
            f"File: {dataset.file_name}",
            f"Type: {dataset.file_type}",
            f"Rows: {summary.get('rows', 'N/A')}",
            f"Columns: {', '.join(summary.get('column_names', []))}",
        ]
        
        if sample := summary.get('sample_rows'):
            context_parts.append(f"Sample Data: {str(sample[:3])}")
        
        if domain := summary.get('domain'):
            context_parts.append(f"Domain: {domain}")
        
        if problem_type := summary.get('problem_type'):
            context_parts.append(f"Problem Type: {problem_type}")
        
        return "\n".join(context_parts)

    async def get_messages(self, session_id: UUID, user_id: str, limit: int, cursor: UUID | None) -> tuple[list[ChatMessage], UUID | None, bool]:
        page_size = max(1, min(limit, MAX_CHAT_PAGE_SIZE))
        session = await self.session.scalar(
            select(ChatSession).join(ChatSession.project).where(ChatSession.session_id == session_id, Project.user_id == user_id)
        )
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

        stmt: Select[tuple[ChatMessage]] = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc(), ChatMessage.message_id.desc())
        )

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

    async def get_session(self, session_id: UUID, user_id: str) -> ChatSession:
        session = await self.session.scalar(
            select(ChatSession)
            .join(ChatSession.project)
            .where(ChatSession.session_id == session_id, Project.user_id == user_id)
        )
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
        return session

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

    async def get_messages_by_project(self, project_id: UUID, user_id: str, limit: int, cursor: UUID | None) -> tuple[list[ChatMessage], UUID | None, bool]:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        chat_session = await self.session.scalar(
            select(ChatSession).where(ChatSession.project_id == project_id)
        )
        if not chat_session:
            return [], None, False

        return await self.get_messages(chat_session.session_id, user_id, limit, cursor)
