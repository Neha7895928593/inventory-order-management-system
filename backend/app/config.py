from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Ethara Inventory API"
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/inventory_db"
    frontend_origin: str = "http://localhost:5173"
    low_stock_threshold: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()


def get_normalized_database_url() -> str:
    database_url = settings.database_url

    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)

    if database_url.startswith("postgresql://") and not database_url.startswith("postgresql+"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    return database_url
