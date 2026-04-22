from typing import Optional
import redis.asyncio as aioredis

from app.config import settings

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def get_cache(key: str) -> Optional[str]:
    try:
        r = await get_redis()
        return await r.get(key)
    except Exception:
        return None


async def set_cache(key: str, value: str, ttl: int | None = None) -> None:
    try:
        r = await get_redis()
        await r.set(key, value, ex=ttl or settings.cache_ttl_seconds)
    except Exception:
        pass
