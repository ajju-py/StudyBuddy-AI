"""
StudyBuddy AI - Application Configuration
Safe configuration management using Pydantic Settings.
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = BASE_DIR / "data"
DEFAULT_UPLOADS_DIR = DEFAULT_DATA_DIR / "uploads"

# Ensure directories exist
DEFAULT_DATA_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    # Groq API Configuration
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    
    # Server Configuration
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    # Storage Configuration
    database_url: str = f"sqlite:///{DEFAULT_DATA_DIR / 'studybuddy.db'}"
    storage_dir: str = str(DEFAULT_UPLOADS_DIR)
    
    # Constraints
    max_upload_size_mb: int = 15
    max_agent_tool_iterations: int = 5
    
    # Supported Groq Models
    supported_models: List[str] = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
    ]

    model_config = SettingsConfigDict(
        env_file=[
            str(BASE_DIR / ".env"),
            str(BASE_DIR.parent / ".env"),
        ],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def is_groq_configured(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key.strip() and not self.groq_api_key.startswith("your_groq"))

    def get_masked_groq_key(self) -> str:
        """Returns masked API key for UI status display without revealing secret."""
        if not self.is_groq_configured():
            return "Not Configured"
        key = self.groq_api_key.strip()
        if len(key) <= 8:
            return "***"
        return f"{key[:4]}...{key[-4:]}"

    def safe_status(self) -> dict:
        """Safe status payload containing no secrets."""
        return {
            "groq_configured": self.is_groq_configured(),
            "masked_key": self.get_masked_groq_key(),
            "active_model": self.groq_model,
            "supported_models": self.supported_models,
            "storage_dir": self.storage_dir,
            "max_upload_size_mb": self.max_upload_size_mb,
            "max_tool_iterations": self.max_agent_tool_iterations,
        }


settings = Settings()
