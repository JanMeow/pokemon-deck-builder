import re
import asyncio
import json
from typing import Any

import httpx
from bs4 import BeautifulSoup

from app.cache import get_cache, set_cache
from app.services.pokemon_tcg import search_cards

LIMITLESS_BASE = "https://limitlesstcg.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
# Cache meta list for 1 hour, individual deck cards for 6 hours
META_TTL   = 3600
DECK_TTL   = 21600


async def get_meta_decks(format: str = "standard") -> list[dict[str, Any]]:
    cache_key = f"limitless:meta:{format}"
    cached = await get_cache(cache_key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(
            f"{LIMITLESS_BASE}/decks",
            headers=HEADERS,
            params={"format": format},
            timeout=15,
        )
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    decks: list[dict] = []

    for row in soup.find_all("tr"):
        a_tag = row.find("a", href=re.compile(r"^/decks/\d+"))
        if not a_tag:
            continue

        deck_id = a_tag["href"].split("/")[-1]
        name = a_tag.get_text(strip=True)
        if not name:
            continue

        tds = row.find_all("td")
        share = tds[4].get_text(strip=True) if len(tds) >= 5 else ""
        count = tds[3].get_text(strip=True) if len(tds) >= 4 else ""

        # Grab the first Pokémon image in the row as a thumbnail hint
        img = row.find("img")
        thumbnail = img["src"] if img and img.get("src") else ""

        decks.append({
            "id": deck_id,
            "name": name,
            "share": share,
            "count": count,
            "thumbnail": thumbnail,
        })

    if decks:
        await set_cache(cache_key, json.dumps(decks), ttl=META_TTL)

    return decks


async def _resolve_by_set_number(set_code: str, number: str) -> dict[str, Any] | None:
    try:
        result = await search_cards(
            f"set.ptcgoCode:{set_code} number:{number}",
            page=1,
            page_size=1,
        )
        if result.get("data"):
            return result["data"][0]
        return None
    except Exception:
        return None


async def get_deck_cards(deck_id: str) -> list[dict[str, Any]]:
    """
    Fetch a Limitless TCG meta deck, parse the card list, and resolve
    each card via pokemontcg.io. Returns [{card_id, quantity, card}].
    """
    cache_key = f"limitless:deck:{deck_id}"
    cached = await get_cache(cache_key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(
            f"{LIMITLESS_BASE}/decks/{deck_id}",
            headers=HEADERS,
            timeout=15,
        )
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    raw_cards: list[dict] = []
    seen: set[str] = set()

    _card_href_re = re.compile(r"^/cards/([A-Za-z0-9]+)/(\w+)$")

    for a_tag in soup.find_all("a", href=_card_href_re):
        href = a_tag.get("href", "")
        m_href = _card_href_re.match(href)
        if not m_href:
            continue
        set_code = m_href.group(1).upper()
        number   = m_href.group(2)

        key = f"{set_code}/{number}"
        if key in seen:
            continue
        seen.add(key)

        # Walk up the DOM to find a container holding quantity for this card only.
        # Stop at the first ancestor that contains exactly one valid card link.
        qty: int | None = None
        pct: float | None = None
        node = a_tag.parent

        for _ in range(6):
            if node is None or node.name in ("body", "html"):
                break
            sibling_cards = [
                l for l in node.find_all("a", href=_card_href_re)
                if _card_href_re.match(l.get("href", ""))
            ]
            if len(sibling_cards) <= 1:
                text = node.get_text(" ", strip=True)
                m_qty = re.search(r"(\d+)\s+in\s+([\d.]+)\s*%", text)
                if m_qty:
                    qty = int(m_qty.group(1))
                    pct = float(m_qty.group(2))
                    break
                # Plain quantity fallback (individual tournament deck)
                m_plain = re.search(r"(?<!\d)([1-4])(?!\d)", text)
                if m_plain and len(text) < 100:
                    qty = int(m_plain.group(1))
                    pct = 100.0
                    break
            node = node.parent

        if qty is None or pct is None:
            continue
        if pct >= 50:   # skip fringe inclusions
            raw_cards.append({"set_code": set_code, "number": number, "qty": qty, "pct": pct})

    if not raw_cards:
        return []

    # Resolve all cards concurrently (throttled)
    sem = asyncio.Semaphore(5)

    async def resolve(c: dict) -> dict | None:
        async with sem:
            card = await _resolve_by_set_number(c["set_code"], c["number"])
            if not card:
                return None
            return {"card_id": card["id"], "quantity": c["qty"], "card": card}

    results = await asyncio.gather(*[resolve(c) for c in raw_cards])
    deck_cards = [r for r in results if r is not None]

    if deck_cards:
        await set_cache(cache_key, json.dumps(deck_cards), ttl=DECK_TTL)

    return deck_cards
