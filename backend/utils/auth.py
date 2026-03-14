from functools import lru_cache
from typing import Any

import jwt
from fastapi import Header, HTTPException, status
from pydantic import BaseModel

from config import get_settings


class AuthenticatedUser(BaseModel):
    user_id: str
    claims: dict[str, Any]


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
