from typing import Any

from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session

DEV_USER_ID = "omnix-dev-user"
DEV_USER_NAME = "Omnix Dev User"
DEV_USER_EMAIL = "dev@omnix.local"


class AuthenticatedUser(BaseModel):
    user_id: str
    claims: dict[str, Any]


async def _ensure_dev_user(session: AsyncSession) -> str:
    existing_user_id = await session.scalar(
        text('SELECT id FROM "user" WHERE id = :user_id'),
        {"user_id": DEV_USER_ID},
    )
    if existing_user_id:
        return str(existing_user_id)

    await session.execute(
        text(
            """
            INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
            VALUES (:user_id, :name, :email, false, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {
            "user_id": DEV_USER_ID,
            "name": DEV_USER_NAME,
            "email": DEV_USER_EMAIL,
        },
    )
    await session.commit()
    return DEV_USER_ID


async def get_current_user(
    session: AsyncSession = Depends(get_db_session),
) -> AuthenticatedUser:
    user_id = await _ensure_dev_user(session)
    return AuthenticatedUser(
        user_id=user_id,
        claims={"auth_disabled": True, "auth_mode": "development"},
    )
