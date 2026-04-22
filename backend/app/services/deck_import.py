import re
import asyncio
from typing import Any

from app.services.pokemon_tcg import search_cards


def parse_ptcgl(text: str) -> list[dict]:
    """Extract (qty, name, set_code, number) lines from a PTCGL deck export."""
    cards = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        # Skip section headers: "Pokémon: 12", "Trainer: 4", "Energy: 8", "Total Cards: 60"
        if re.match(r'^(Pok[eé]mon|Trainer|Energy|Total)\b', line, re.IGNORECASE):
            continue
        # Card lines: {qty} {name} {SET_CODE} {number}
        # SET_CODE is 2-6 uppercase alphanumeric chars; number can be "125", "GG60", "TG29"
        m = re.match(r'^(\d+)\s+(.+?)\s+([A-Za-z0-9]{2,6})\s+(\w+)\s*$', line)
        if m:
            qty, name, set_code, number = m.groups()
            cards.append({
                'qty': int(qty),
                'name': name.strip(),
                'set_code': set_code.upper(),
                'number': number,
            })
    return cards


async def _resolve_card(set_code: str, number: str, name: str) -> dict[str, Any] | None:
    try:
        # Primary: exact set ptcgoCode + number (most reliable)
        result = await search_cards(
            f'set.ptcgoCode:{set_code} number:{number}',
            page=1,
            page_size=1,
        )
        if result.get('data'):
            return result['data'][0]
        # Fallback: name search (catches promo numbering differences)
        result = await search_cards(f'name:"{name}"', page=1, page_size=1)
        if result.get('data'):
            return result['data'][0]
        return None
    except Exception:
        return None


async def import_ptcgl(text: str) -> list[dict[str, Any]]:
    """
    Parse a PTCGL export and resolve every card via pokemontcg.io.
    Returns a list of {card_id, quantity} dicts, skipping unresolved cards.
    """
    parsed = parse_ptcgl(text)
    if not parsed:
        return []

    # Throttle to 5 concurrent requests to stay within free-tier rate limits
    sem = asyncio.Semaphore(5)

    async def lookup(c: dict) -> dict[str, Any] | None:
        async with sem:
            return await _resolve_card(c['set_code'], c['number'], c['name'])

    resolved = await asyncio.gather(*[lookup(c) for c in parsed])

    deck_cards = []
    for card, meta in zip(resolved, parsed):
        if card:
            deck_cards.append({'card_id': card['id'], 'quantity': meta['qty']})

    return deck_cards
