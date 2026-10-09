import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "PlaceMate AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./placemate.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    CORS_ORIGINS: list = ["*"]

    # Real-World Job Search Providers Configuration
    JOB_PROVIDER: str = os.getenv("JOB_PROVIDER", "auto")
    ADZUNA_APP_ID: str = os.getenv("ADZUNA_APP_ID", "")
    ADZUNA_APP_KEY: str = os.getenv("ADZUNA_APP_KEY", "")
    ADZUNA_COUNTRY: str = os.getenv("ADZUNA_COUNTRY", "in")
    JOOBLE_API_KEY: str = os.getenv("JOOBLE_API_KEY", "")

settings = Settings()
