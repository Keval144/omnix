from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
import httpx

from db.session import get_db_session
from config import get_settings

settings = get_settings()

DEV_USER_ID = "omnix-dev-user"
DEV_USER_NAME = "Omnix Dev User"
DEV_USER_EMAIL = "dev@omnix.local"

security = HTTPBearer()

DEV_USER_ID = "omnix-dev-user"
DEV_USER_NAME = "Omnix Dev User"
DEV_USER_EMAIL = "dev@omnix.local"


class AuthenticatedUser(BaseModel):
    user_id: str
    claims: dict[str, Any]


async def _get_jwks() -> dict:
    if not settings.better_auth_jwks_url:
        return {}
    async with httpx.AsyncClient() as client:
        response = await client.get(settings.better_auth_jwks_url)
        response.raise_for_status()
        return response.json()


async def _validate_token(token: str) -> dict[str, Any]:
    jwks = await _get_jwks()
    if not jwks:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWKS not configured")
    
    # Assume RS256
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    key = None
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
            break
    if not key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    try:
        payload = jwt.decode(token, key, algorithms=["RS256"], audience=settings.jwt_audience, issuer=settings.jwt_issuer)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


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
    return AuthenticatedUser(user_id=user_id, claims={})
