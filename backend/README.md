# Pokemon Deck Builder API

FastAPI service that proxies and caches the [Pokemon TCG API](https://pokemontcg.io/), stores deck metadata, imports deck lists, and exposes meta deck data for the web app.

## Requirements

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (recommended) or another way to install dependencies from `pyproject.toml`
- Redis (optional). If Redis is unavailable, the API still runs; caching is skipped when connections fail.

## Configuration

Create `app/.env` (next to `main.py`) or set environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `POKEMON_TCG_API_KEY` | API key from [Pokemon TCG Developer Portal](https://dev.pokemontcg.io/). Improves rate limits. | empty |
| `REDIS_URL` | Redis connection URL for response caching | `redis://localhost:6379` |
| `CACHE_TTL_SECONDS` | Cache TTL for TCG API responses | `3600` |

## Run locally

From the `backend` directory:

```bash
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: [http://localhost:8000/health](http://localhost:8000/health)

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

CORS is configured for the Vite dev server at `http://localhost:5173`.
