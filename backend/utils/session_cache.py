import asyncio
import time
from dataclasses import dataclass
from typing import Any

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from schemas.chat_schema import ChatSessionInfoResponse
from services.chat_service import ChatService


SESSION_INFO_CACHE_TTL = 300


@dataclass
class CacheEntry:
    value: Any
    timestamp: float


class AsyncSafeCache:
    def __init__(self, ttl: int = 300, max_size: int = 1000):
        self._cache: dict[str, CacheEntry] = {}
        self._lock = asyncio.Lock()
        self._ttl = ttl
        self._max_size = max_size
        self._cleanup_task: asyncio.Task | None = None

    async def get(self, key: str) -> Any | None:
        async with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None

            if time.monotonic() - entry.timestamp > self._ttl:
                del self._cache[key]
                return None

            return entry.value

    async def set(self, key: str, value: Any) -> None:
        async with self._lock:
            if len(self._cache) >= self._max_size:
                await self._evict_oldest()

            self._cache[key] = CacheEntry(value=value, timestamp=time.monotonic())

    async def _evict_oldest(self) -> None:
        if not self._cache:
            return
        oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k].timestamp)
        del self._cache[oldest_key]

    async def cleanup_expired(self) -> None:
        async with self._lock:
            now = time.monotonic()
            expired_keys = [
                k for k, v in self._cache.items()
                if now - v.timestamp > self._ttl
            ]
            for key in expired_keys:
                del self._cache[key]

    async def start_cleanup_task(self) -> None:
        async def cleanup_loop():
            while True:
                await asyncio.sleep(self._ttl // 2)
                await self.cleanup_expired()

        self._cleanup_task = asyncio.create_task(cleanup_loop())

    async def stop_cleanup_task(self) -> None:
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass


_session_info_cache = AsyncSafeCache(ttl=SESSION_INFO_CACHE_TTL, max_size=1000)


async def get_cached_session_info(
    session_id: str,
    user_id: str,
    session: AsyncSession,
    chat_service: ChatService = Depends(),
) -> ChatSessionInfoResponse:
    cache_key = f"{session_id}:{user_id}"

    cached = await _session_info_cache.get(cache_key)
    if cached:
        return cached

    info = await chat_service.get_session_info(session_id, user_id)
    response = ChatSessionInfoResponse(**info)
    await _session_info_cache.set(cache_key, response)
    return response


async def init_session_cache():
    await _session_info_cache.start_cleanup_task()


async def shutdown_session_cache():
    await _session_info_cache.stop_cleanup_task()