"""
StudyBuddy AI - Official Groq API Service
Provides robust, secure, and production-ready integration with the Groq Python SDK.
Handles authentication, model validation, bounded retries, and tool-calling completions.
"""

import time
import logging
from typing import List, Dict, Any, Optional
from groq import Groq, GroqError, AuthenticationError, RateLimitError, APIConnectionError, NotFoundError
from app.config import settings

logger = logging.getLogger("studybuddy.groq")


class GroqConfigError(Exception):
    """Raised when Groq API key is missing or improperly configured."""
    pass


class GroqService:
    def __init__(self):
        self._client: Optional[Groq] = None
        self._initialized = False

    def get_client(self) -> Groq:
        """
        Lazily initializes and returns the Groq client.
        Ensures secrets are not exposed in logs or exceptions.
        """
        if not settings.is_groq_configured():
            raise GroqConfigError(
                "Groq API key is not configured. Please set a valid GROQ_API_KEY in your environment or .env file."
            )

        if not self._initialized or self._client is None:
            self._client = Groq(api_key=settings.groq_api_key)
            self._initialized = True

        return self._client

    def validate_model(self, model: Optional[str] = None) -> str:
        """Validates that the selected model is supported."""
        target_model = model or settings.groq_model
        if target_model not in settings.supported_models:
            logger.warning(
                "Requested model '%s' is not in supported list. Defaulting to '%s'",
                target_model,
                settings.groq_model,
            )
            return settings.groq_model
        return target_model

    def create_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.4,
        max_tokens: int = 2048,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = "auto",
    ) -> Any:
        """
        Sends a chat completion request to the Groq API with bounded retries for transient errors.
        Never retries permanent authentication failures indefinitely.
        """
        client = self.get_client()
        active_model = self.validate_model(model)

        max_retries = 2
        retry_delay = 1.0

        for attempt in range(max_retries + 1):
            try:
                kwargs: Dict[str, Any] = {
                    "model": active_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if tools:
                    kwargs["tools"] = tools
                    if tool_choice:
                        kwargs["tool_choice"] = tool_choice

                response = client.chat.completions.create(**kwargs)
                return response

            except AuthenticationError as e:
                # Never retry authentication errors
                logger.error("Groq authentication failed: Invalid or expired API key.")
                raise GroqConfigError("Invalid Groq API key. Please check your credentials.") from e

            except NotFoundError as e:
                logger.error("Groq model '%s' not found: %s", active_model, str(e))
                fallback_candidates = [
                    "openai/gpt-oss-120b",
                    "openai/gpt-oss-20b",
                    "qwen/qwen3.8-27b",
                    "llama-3.3-70b-versatile",
                ]
                for fb in fallback_candidates:
                    if fb != active_model:
                        logger.info("Attempting fallback to '%s'", fb)
                        active_model = fb
                        break
                else:
                    raise
                continue

            except RateLimitError as e:
                if attempt < max_retries:
                    logger.warning("Groq rate limit reached (429). Retrying in %.1fs...", retry_delay)
                    time.sleep(retry_delay)
                    retry_delay *= 2.0
                    continue
                logger.error("Groq rate limit exceeded after %d retries.", max_retries)
                raise

            except APIConnectionError as e:
                if attempt < max_retries:
                    logger.warning("Groq connection error. Retrying in %.1fs...", retry_delay)
                    time.sleep(retry_delay)
                    retry_delay *= 1.5
                    continue
                logger.error("Failed to connect to Groq API after %d retries.", max_retries)
                raise

            except GroqError as e:
                logger.error("Groq API error encountered: %s", str(e))
                raise


groq_service = GroqService()
