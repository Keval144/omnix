from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from constants import DEFAULT_CHAT_PAGE_SIZE
from db.session import get_db_session
from schemas.chat_schema import ChatMessageCreate, ChatMessagePage, ChatMessageResponse
from schemas.chat_schema import ChatSessionResponse
from services.chat_service import ChatService
from utils.auth import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", status_code=status.HTTP_201_CREATED)
async def post_message(
    payload: ChatMessageCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    chat_session, user_message, assistant_message = await ChatService(session).create_message(
        payload.project_id,
        current_user.user_id,
        payload.content,
        payload.session_id,
    )
    return {
        "session_id": chat_session.session_id,
        "messages": [
            ChatMessageResponse.model_validate(user_message),
            ChatMessageResponse.model_validate(assistant_message),
        ],
    }


@router.get("/messages", response_model=ChatMessagePage)
async def get_messages(
    session_id: UUID,
    cursor: UUID | None = Query(default=None),
    limit: int = Query(default=DEFAULT_CHAT_PAGE_SIZE, ge=1, le=100),
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ChatMessagePage:
    items, next_cursor, has_more = await ChatService(session).get_messages(session_id, current_user.user_id, limit, cursor)
    return ChatMessagePage(
        items=[ChatMessageResponse.model_validate(item) for item in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )


@router.get("/session/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ChatSessionResponse:
    chat_session = await ChatService(session).get_session(session_id, current_user.user_id)
    return ChatSessionResponse.model_validate(chat_session)


@router.get("/history", response_model=ChatMessagePage)
async def get_chat_history(
    project_id: UUID,
    cursor: UUID | None = Query(default=None),
    limit: int = Query(default=DEFAULT_CHAT_PAGE_SIZE, ge=1, le=100),
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ChatMessagePage:
    items, next_cursor, has_more = await ChatService(session).get_messages_by_project(
        project_id, current_user.user_id, limit, cursor
    )
    return ChatMessagePage(
        items=[ChatMessageResponse.model_validate(item) for item in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )
