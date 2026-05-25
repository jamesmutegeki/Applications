from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./messenger.db"
    secret_key: str = "change-me-in-production-use-env-var"
    allowed_origins: list[str] = ["*"]
    max_file_size_mb: int = 10
    ws_heartbeat_interval: int = 30
    message_ttl_cleanup_minutes: int = 5
    max_one_time_prekeys: int = 100

    class Config:
        env_file = ".env"
        env_prefix = "MESSENGER_"


settings = Settings()

# Override database_url from plain DATABASE_URL if present (Render provides this)
import os
if "DATABASE_URL" in os.environ:
    raw = os.environ["DATABASE_URL"]
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql+asyncpg://", 1)
    elif raw.startswith("postgresql://"):
        raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)
    settings.database_url = raw
