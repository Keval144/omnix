import asyncio
import time
from collections import defaultdict
from typing import Callable

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware


class TokenBucketRateLimiter:
    def __init__(self, rate: int = 60, per: int = 60):
        self.rate = rate
        self.per = per
        self.buckets: dict[str, tuple[int, float]] = {}
        self._lock = asyncio.Lock()

    async def _refill(self, key: str) -> tuple[int, float]:
        now = time.monotonic()
        tokens, last_refill = self.buckets.get(key, (self.rate, now))

        elapsed = now - last_refill
        refill_amount = int(elapsed * (self.rate / self.per))
        tokens = min(self.rate, tokens + refill_amount)

        self.buckets[key] = (tokens, now)
        return tokens, now

    async def acquire(self, key: str, cost: int = 1) -> bool:
        async with self._lock:
            tokens, _ = await self._refill(key)
            if tokens >= cost:
                tokens -= cost
                self.buckets[key] = (tokens, time.monotonic())
                return True
            return False

    def cleanup(self) -> None:
        now = time.monotonic()
        cutoff = now - self.per * 2
        self.buckets = {
            k: v for k, v in self.buckets.items() if v[1] > cutoff
        }


_rate_limiters: dict[str, TokenBucketRateLimiter] = {}


def get_rate_limiter(name: str = "default", rate: int = 60, per: int = 60) -> TokenBucketRateLimiter:
    if name not in _rate_limiters:
        _rate_limiters[name] = TokenBucketRateLimiter(rate, per)
    return _rate_limiters[name]


def rate_limit(rate: int = 60, per: int = 60, key_func: Callable[[Request], str] | None = None):
    limiter = get_rate_limiter(rate, per)
    cost = max(1, rate // per)

    async def middleware(request: Request, call_next):
        if key_func:
            key = key_func(request)
        else:
            key = request.client.host if request.client else "unknown"

        if not await limiter.acquire(key, cost):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
            )

        return await call_next(request)

    return middleware