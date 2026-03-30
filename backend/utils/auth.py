from typing import Any
from datetime import datetime, timedelta

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

_jwks_cache: dict | None = None
_jwks_cache_time: datetime | None = None
JWKS_CACHE_TTL = timedelta(hours=1)


class AuthenticatedUser(BaseModel):
    user_id: str
    claims: dict[str, Any]


async def _get_jwks() -> dict:
    global _jwks_cache, _jwks_cache_time
    
    if _jwks_cache and _jwks_cache_time and datetime.now() - _jwks_cache_time < JWKS_CACHE_TTL:
        return _jwks_cache
    
    if not settings.better_auth_jwks_url:
        return {}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(settings.better_auth_jwks_url)
        response.raise_for_status()
        _jwks_cache = response.json()
        _jwks_cache_time = datetime.now()
        return _jwks_cache


def clear_jwks_cache() -> None:
    global _jwks_cache, _jwks_cache_time
    _jwks_cache = None
    _jwks_cache_time = None


async def _validate_token(token: str) -> dict[str, Any]:
    jwks = await _get_jwks()
    if not jwks:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWKS not configured")
    
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    key = None
    algorithm = None
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            kty = jwk.get("kty")
            if kty == "RSA":
                key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                algorithm = "RS256"
            elif kty == "OKP":
                key = jwt.algorithms.OKPAlgorithm.from_jwk(jwk)
                algorithm = "EdDSA"
            break
    if not key or not algorithm:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unsupported key type")
    
    try:
        payload = jwt.decode(token, key, algorithms=[algorithm], audience=settings.resolved_jwt_audience, issuer=settings.resolved_jwt_issuer)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def _ensure_user(session: AsyncSession, user_id: str, email: str | None = None, name: str | None = None) -> str:
    existing_user_id = await session.scalar(
        text('SELECT id FROM "user" WHERE id = :user_id'),
        {"user_id": user_id},
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
            "user_id": user_id,
            "name": name or DEV_USER_NAME,
            "email": email or DEV_USER_EMAIL,
        },
    )
    await session.commit()
    return user_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db_session),
) -> AuthenticatedUser:
    token = credentials.credentials
    claims = await _validate_token(token)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing subject")
    await _ensure_user(session, user_id, claims.get("email"), claims.get("name"))
    return AuthenticatedUser(user_id=str(user_id), claims=claims)
