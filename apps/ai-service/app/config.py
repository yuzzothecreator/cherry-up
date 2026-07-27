from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    app_name: str = "Cherry-Up AI Service"
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
