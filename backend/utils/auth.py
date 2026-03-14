from typing import Any

from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from functools import lru_cache
from fastapi import Header, HTTPException, status

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
@lru_cache
def get_jwk_client() -> jwt.PyJWKClient:
    settings = get_settings()
    return jwt.PyJWKClient(settings.resolved_jwks_url)


async def get_current_user(authorization: str = Header(...)) -> AuthenticatedUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")

    token = authorization.split(" ", 1)[1]
    settings = get_settings()

    try:
        signing_key = get_jwk_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[signing_key.algorithm_name or "EdDSA", "EdDSA", "RS256", "ES256"],
            audience=settings.resolved_jwt_audience,
            issuer=settings.resolved_jwt_issuer,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")

    return AuthenticatedUser(user_id=str(user_id), claims=payload)
