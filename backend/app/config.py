from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Ethara Inventory API"
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/inventory_db"
    frontend_origin: str = "http://localhost:5173"
    low_stock_threshold: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
