from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str = ""
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
GROQ_API_KEY="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"