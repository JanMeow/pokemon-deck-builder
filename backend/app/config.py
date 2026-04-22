from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    pokemon_tcg_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    cache_ttl_seconds: int = 3600

    class Config:
        env_file = ".env"


settings = Settings()
