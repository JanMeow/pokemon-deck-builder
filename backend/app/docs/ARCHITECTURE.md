# Backend Architecture

## Overview

FastAPI backend with four routers, two external service integrations, a Redis cache layer, and a LangGraph simulation agent.

```
app/
├── main.py           ← FastAPI app, CORS, router registration
├── config.py         ← Pydantic settings loaded from app/.env
├── cache.py          ← Redis async helpers (get/set); silently no-ops if Redis is down
├── routers/          ← HTTP route handlers (thin — delegate to services or agent)
├── services/         ← External API clients (Pokemon TCG, Limitless)
├── models/           ← Pydantic request/response models
└── agent/            ← LangGraph simulation agent (see agent/ARCHITECTURE.md)
```

## Routers

| Prefix | File | Description |
|--------|------|-------------|
| `GET /health` | `main.py` | Liveness check |
| `/cards` | `routers/cards.py` | Proxy to Pokemon TCG API — search cards, get sets, get card by ID |
| `/decks` | `routers/decks.py` | CRUD for user decks + PTCGL import. Currently in-memory (`_store` dict); swap for Postgres when ready |
| `/meta` | `routers/meta.py` | Scrapes Limitless TCG for meta deck lists and decklists |
| `/agent` | `routers/agent.py` | Triggers simulation and feedback via the LangGraph agent |

### Agent endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/agent/simulate` | Run a match simulation between two decks |
| `POST` | `/agent/feedback` | Return reviewer analysis for a completed simulation |

## Services

### `services/pokemon_tcg.py`
Wraps the [Pokemon TCG API v2](https://api.pokemontcg.io/v2). All responses are Redis-cached.

| Function | Description |
|----------|-------------|
| `search_cards(query, page, page_size, order_by)` | Lucene query search — spaces encoded as `%20` (not `+`) to preserve phrase queries |
| `get_card(card_id)` | Fetch single card by ID |
| `get_sets()` | Fetch all sets |

### `services/limitless.py`
Scrapes [Limitless TCG](https://limitlesstcg.com/) for competitive meta data.

| Function | Description |
|----------|-------------|
| `get_meta_decks(format)` | List of meta decks for a given format (standard, expanded, etc.) |
| `get_deck_cards(deck_id)` | Card list for a specific meta deck |

### `services/deck_import.py`
Parses PTCGL export text into resolved card objects by matching names against the TCG API.

## Cache (`cache.py`)

Redis-backed, async. Used by `services/pokemon_tcg.py` for all external API responses.

- `get_cache(key)` — returns `None` on miss or Redis failure
- `set_cache(key, value, ttl?)` — silently swallows connection errors so the app runs without Redis

Cache keys:

| Key pattern | Source |
|-------------|--------|
| `cards:{query}:{page}:{page_size}:{order_by}` | Card search |
| `card:{card_id}` | Single card |
| `sets:all` | All sets |

## Configuration (`config.py`)

Loaded from `app/.env` via Pydantic settings. Accessed via the shared `settings` singleton.

| Setting | Env var | Default |
|---------|---------|---------|
| `anthropic_api_key` | `ANTHROPIC_API_KEY` | `""` |
| `pokemon_tcg_api_key` | `POKEMON_TCG_API_KEY` | `""` |
| `redis_url` | `REDIS_URL` | `redis://localhost:6379` |
| `cache_ttl_seconds` | `CACHE_TTL_SECONDS` | `3600` |

## Known TODOs

- [ ] Replace in-memory `_store` in `routers/decks.py` with Postgres
- [ ] Fill in `SimulateAgentPayload` and `FeedbackAgentPayload` models once agent input/output is defined
- [ ] Wire `routers/agent.py` to the actual LangGraph graph
