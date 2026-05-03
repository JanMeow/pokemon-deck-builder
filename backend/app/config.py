from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env next to this file (not the shell cwd).
_ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
    )

    pokemon_tcg_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    cache_ttl_seconds: int = 3600
    anthropic_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()

# Shared instance
settings: Settings = get_settings()