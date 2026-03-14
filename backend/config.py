from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent

load_dotenv(BASE_DIR / ".env")

IFLOW_API_KEY = os.getenv("IFLOW_API_KEY")
IFLOW_MODEL = os.getenv("IFLOW_MODEL", "glm-4-flash")

IFLOW_API_URL = "https://api.iflow.cn/v1/chat/completions"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Omnix Backend"
    api_v1_prefix: str = ""
    database_url: str = Field(..., alias="DATABASE_URL")
    better_auth_url: str = Field(..., alias="BETTER_AUTH_URL")
    better_auth_jwks_url: str | None = Field(default=None, alias="BETTER_AUTH_JWKS_URL")
    jwt_audience: str | None = Field(default=None, alias="JWT_AUDIENCE")
    jwt_issuer: str | None = Field(default=None, alias="JWT_ISSUER")
    storage_root: Path = Field(default=BASE_DIR / "storage", alias="STORAGE_ROOT")
    data_storage_url_prefix: str = Field("", alias="DATA_STORAGE_URL_PREFIX")
    db_pool_size: int = Field(10, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(20, alias="DB_MAX_OVERFLOW")
    db_pool_timeout: int = Field(30, alias="DB_POOL_TIMEOUT")
    db_pool_recycle: int = Field(1800, alias="DB_POOL_RECYCLE")

    @field_validator("storage_root", mode="before")
    @classmethod
    def resolve_storage_root(cls, value: str | Path) -> Path:
        path = Path(value)
        if path.is_absolute():
            return path
        return (REPO_ROOT / path).resolve()

    @property
    def resolved_jwks_url(self) -> str:
        return self.better_auth_jwks_url or f"{self.better_auth_url.rstrip('/')}/api/auth/jwks"

    @property
    def resolved_jwt_issuer(self) -> str:
        return self.jwt_issuer or self.better_auth_url.rstrip("/")

    @property
    def resolved_jwt_audience(self) -> str:
        return self.jwt_audience or self.better_auth_url.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
