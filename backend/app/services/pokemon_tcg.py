import json
import httpx
from urllib.parse import quote
from typing import Any

from app.config import settings
from app.cache import get_cache, set_cache

BASE_URL = "https://api.pokemontcg.io/v2"


def _headers() -> dict:
    h = {"Content-Type": "application/json"}
    if settings.pokemon_tcg_api_key:
        h["X-Api-Key"] = settings.pokemon_tcg_api_key
    return h


async def search_cards(
    query: str,
    page: int = 1,
    page_size: int = 20,
    order_by: str = "-set.releaseDate",
) -> dict[str, Any]:
    cache_key = f"cards:{query}:{page}:{page_size}:{order_by}"
    cached = await get_cache(cache_key)
    if cached:
        return json.loads(cached)

    # Build URL manually so spaces in the query stay as %20.
    # httpx encodes spaces as + which breaks Lucene phrase queries like name:"charizard ex".
    qs_parts = [f"page={page}", f"pageSize={page_size}", f"orderBy={quote(order_by, safe='.-')}"]
    if query:
        safe = ':*"()'
        qs_parts.insert(0, f"q={quote(query, safe=safe)}")
    url = f"{BASE_URL}/cards?{'&'.join(qs_parts)}"

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            url,
            headers=_headers(),
            timeout=15,
        )
        if resp.status_code != 200:
            raise ValueError(f"pokemontcg.io {resp.status_code}: {resp.text}")
        data = resp.json()

    await set_cache(cache_key, json.dumps(data))
    return data


async def get_card(card_id: str) -> dict[str, Any]:
    cache_key = f"card:{card_id}"
    cached = await get_cache(cache_key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/cards/{card_id}",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

    await set_cache(cache_key, json.dumps(data))
    return data


async def get_sets() -> dict[str, Any]:
    cache_key = "sets:all"
    cached = await get_cache(cache_key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/sets",
            headers=_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

    await set_cache(cache_key, json.dumps(data))
    return data
