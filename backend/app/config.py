from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    groq_api_key: str = ""
    github_token: Optional[str] = None
    database_url: str = "sqlite+aiosqlite:///./codelens.db"
    max_files_per_review: int = 10
    max_file_size_kb: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
