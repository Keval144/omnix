import asyncio
import logging
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from constants import MAX_CHAT_PAGE_SIZE, RECENT_MESSAGES_WINDOW, SUMMARY_THRESHOLD
from llm.iflow_client import IFlowClient
from models.chat import ChatMessage, ChatRole, ChatSession
from models.dataset import Dataset
from models.project import Project
from models.token import TokenRequestType
from prompts.chat_prompts import build_chat_prompt
from services.project_service import ProjectService
from services.summary_service import build_conversation_history, summarize_conversation
from services.token_service import TokenService
from utils.token_counter import count_tokens

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_service = ProjectService(session)
        self.token_service = TokenService(session)

    async def create_message(
        self, project_id: UUID, user_id: str, content: str, session_id: UUID | None
    ) -> tuple[ChatSession, ChatMessage, ChatMessage]:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        chat_session = await self._get_or_create_session(project.project_id, session_id)

        user_message = ChatMessage(session_id=chat_session.session_id, role=ChatRole.USER, content=content)
        self.session.add(user_message)
        await self.session.flush()

        conversation_history, earlier_summary, summary_tokens = await self._get_conversation_context(
            chat_session.session_id
        )

        response_content, tokens_used = await self._get_dataset_context_and_generate(
            project.project_id, content, conversation_history, earlier_summary
        )

        total_tokens = tokens_used + summary_tokens
        await self.token_service.increment_tokens(
            user_id=user_id,
            project_id=project_id,
            tokens_used=total_tokens,
            request_type=TokenRequestType.CHAT,
        )

        assistant_message = ChatMessage(
            session_id=chat_session.session_id,
            role=ChatRole.ASSISTANT,
            content=response_content,
        )
        self.session.add(assistant_message)
        chat_session.total_tokens_used += total_tokens
        await self.session.commit()
        return chat_session, user_message, assistant_message

    async def create_message_stream(
        self, project_id: UUID, user_id: str, content: str, session_id: UUID | None
    ):
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        chat_session = await self._get_or_create_session(project.project_id, session_id)

        user_message = ChatMessage(session_id=chat_session.session_id, role=ChatRole.USER, content=content)
        self.session.add(user_message)
        await self.session.flush()

        import json
        yield f"data: {json.dumps({
            'message_id': str(user_message.message_id),
            'session_id': str(user_message.session_id),
            'role': user_message.role.value,
            'content': user_message.content,
            'created_at': user_message.created_at.isoformat()
        })}\n\n"

        conversation_history, earlier_summary, summary_tokens = await self._get_conversation_context(
            chat_session.session_id
        )

        dataset = await self._get_dataset_context(project.project_id)
        context = None
        if dataset and dataset.summary:
            context = self._build_context_from_dataset(dataset)

        full_prompt, system_prompt = build_chat_prompt(
            content, context, conversation_history, earlier_summary
        )

        prompt_tokens = count_tokens(full_prompt) + count_tokens(system_prompt)

        accumulated_content = ""
        async for chunk in IFlowClient.generate_stream_async(full_prompt, system_prompt):
            accumulated_content += chunk
            yield f"data: {chunk}\n\n"

        response_tokens = count_tokens(accumulated_content)
        total_tokens = prompt_tokens + response_tokens
        logger.info(f"LLM streaming request: {total_tokens} tokens (prompt: {prompt_tokens}, response: {response_tokens})")

        await self.token_service.increment_tokens(
            user_id=user_id,
            project_id=project_id,
            tokens_used=total_tokens,
            request_type=TokenRequestType.CHAT,
        )

        assistant_message = ChatMessage(
            session_id=chat_session.session_id,
            role=ChatRole.ASSISTANT,
            content=accumulated_content,
        )
        self.session.add(assistant_message)
        chat_session.total_tokens_used += total_tokens
        await self.session.commit()

        yield "data: [DONE]\n\n"

    async def _get_conversation_context(
        self, session_id: UUID
    ) -> tuple[list[dict], str | None, int]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
        )
        all_messages = list((await self.session.scalars(stmt)).all())

        total_messages = len(all_messages)
        summary_tokens = 0
        earlier_summary = None

        if total_messages > SUMMARY_THRESHOLD:
            recent_messages = all_messages[-RECENT_MESSAGES_WINDOW:]
            earlier_messages = all_messages[:-RECENT_MESSAGES_WINDOW]

            earlier_summary = await summarize_conversation(session_id, self.session)
            if earlier_summary:
                summary_tokens = count_tokens(earlier_summary)
                conversation_history = build_conversation_history(recent_messages)
            else:
                recent_with_some_earlier = all_messages[-RECENT_MESSAGES_WINDOW - 10:]
                conversation_history = build_conversation_history(recent_with_some_earlier)
        else:
            conversation_history = build_conversation_history(all_messages)

        logger.debug(
            f"Conversation context: {len(conversation_history)} messages, "
            f"summary: {bool(earlier_summary)}, summary_tokens: {summary_tokens}"
        )

        return conversation_history, earlier_summary, summary_tokens

    async def _get_dataset_context_and_generate(
        self, project_id: UUID, content: str, conversation_history: list[dict], earlier_summary: str | None
    ) -> tuple[str, int]:
        dataset = await self._get_dataset_context(project_id)
        response, tokens_used = await self._generate_response(content, dataset, conversation_history, earlier_summary)
        return response, tokens_used

    async def _get_dataset_context(self, project_id: UUID) -> Dataset | None:
        return await self.session.scalar(select(Dataset).where(Dataset.project_id == project_id))

    async def _generate_response(
        self, prompt: str, dataset: Dataset | None, conversation_history: list[dict], earlier_summary: str | None
    ) -> tuple[str, int]:
        try:
            context = None
            if dataset and dataset.summary:
                context = self._build_context_from_dataset(dataset)

            full_prompt, system_prompt = build_chat_prompt(
                prompt, context, conversation_history, earlier_summary
            )

            prompt_tokens = count_tokens(full_prompt) + count_tokens(system_prompt)
            response = await IFlowClient.generate_async(full_prompt, system_prompt)
            response_tokens = count_tokens(response)

            total_tokens = prompt_tokens + response_tokens
            logger.info(f"LLM request: {total_tokens} tokens (prompt: {prompt_tokens}, response: {response_tokens})")

            return response, total_tokens
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

    async def get_messages(
        self, session_id: UUID, user_id: str, limit: int, cursor: UUID | None
    ) -> tuple[list[ChatMessage], UUID | None, bool]:
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

    async def get_session_info(self, session_id: UUID, user_id: str) -> dict:
        session = await self.get_session(session_id, user_id)
        return {
            "session_id": session.session_id,
            "project_id": session.project_id,
            "created_at": session.created_at,
            "total_tokens_used": session.total_tokens_used,
            "project_metadata": session.project.metadata_json,
        }

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

    async def get_messages_by_project(
        self, project_id: UUID, user_id: str, limit: int, cursor: UUID | None
    ) -> tuple[list[ChatMessage], UUID | None, bool]:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        chat_session = await self.session.scalar(
            select(ChatSession).where(ChatSession.project_id == project_id)
        )
        if not chat_session:
            return [], None, False

        return await self.get_messages(chat_session.session_id, user_id, limit, cursor)
