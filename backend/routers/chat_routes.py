from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from constants import DEFAULT_CHAT_PAGE_SIZE
from db.session import get_db_session
from schemas.chat_schema import ChatMessageCreate, ChatMessagePage, ChatMessageResponse
from schemas.chat_schema import ChatSessionResponse, ChatSessionInfoResponse
from services.chat_service import ChatService
from utils.auth import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

SESSION_INFO_CACHE_TTL = 300
_session_info_cache: dict[str, tuple[datetime, ChatSessionInfoResponse]] = {}


def _get_cached_session_info(session_id: UUID, user_id: str) -> ChatSessionInfoResponse | None:
    cache_key = f"{session_id}:{user_id}"
    if cache_key in _session_info_cache:
        cached_time, response = _session_info_cache[cache_key]
        if (datetime.now() - cached_time).total_seconds() < SESSION_INFO_CACHE_TTL:
            return response
    return None


def _set_cached_session_info(session_id: UUID, user_id: str, response: ChatSessionInfoResponse) -> None:
    cache_key = f"{session_id}:{user_id}"
    _session_info_cache[cache_key] = (datetime.now(), response)


@router.post("/message", status_code=status.HTTP_201_CREATED)
async def post_message(
    payload: ChatMessageCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    chat_service = ChatService(session)
    chat_session, user_message, assistant_message = await chat_service.create_message(
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


@router.post("/message/stream")
async def post_message_stream(
    payload: ChatMessageCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    chat_service = ChatService(session)
    return StreamingResponse(
        chat_service.create_message_stream(
            payload.project_id,
            current_user.user_id,
            payload.content,
            payload.session_id,
        ),
        media_type="text/event-stream",
    )


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


@router.get("/session-info/{session_id}", response_model=ChatSessionInfoResponse)
async def get_session_info(
    session_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ChatSessionInfoResponse:
    cached = _get_cached_session_info(session_id, current_user.user_id)
    if cached:
        return cached

    info = await ChatService(session).get_session_info(session_id, current_user.user_id)
    response = ChatSessionInfoResponse(**info)
    _set_cached_session_info(session_id, current_user.user_id, response)
    return response


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
