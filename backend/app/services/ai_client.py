import os
import json
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# API settings from environment variables (loaded in main.py, accessible via os.getenv)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-1.5-flash-latest") # Default model
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# Determine Referer URL (useful for OpenRouter analytics/tracking)
APP_URL = os.getenv("APP_URL", "http://localhost:8000") # Use backend URL or Render URL

def _get_api_key() -> str:
    """Get the API key and validate it exists."""
    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY environment variable not set.")
        raise ValueError("API key for OpenRouter is missing.")
    return OPENROUTER_API_KEY

def _get_headers() -> Dict[str, str]:
    """Build the common headers needed for API requests."""
    return {
        "Authorization": f"Bearer {_get_api_key()}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": "EasyLesson", # Application name for OpenRouter analytics
    }

def _build_payload(system_prompt: str, user_prompt: str, model: Optional[str] = None) -> Dict[str, Any]:
    """Build the request payload for OpenRouter chat completions."""
    target_model = model or OPENROUTER_MODEL
    logger.debug(f"Building payload for model: {target_model}")
    return {
        "model": target_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"} # Request JSON output
    }

async def call_llm(
    system_prompt: str,
    user_prompt: str,
    model: Optional[str] = None,
    timeout: float = 90.0 # Increased timeout for potentially long generations
) -> str:
    """
    Sends a request to the OpenRouter API and returns the content of the response.

    Args:
        system_prompt: The system prompt for the LLM.
        user_prompt: The user prompt for the LLM.
        model: Optional override for the model defined in environment variables.
        timeout: Request timeout in seconds.

    Returns:
        The string content of the LLM's response (expected to be JSON).

    Raises:
        ValueError: If API key is missing or response format is unexpected.
        ConnectionError: If the request to OpenRouter fails (network issue, status code error).
        TimeoutError: If the request times out.
    """
    headers = _get_headers() # Raises ValueError if key is missing
    payload = _build_payload(system_prompt, user_prompt, model)
    model_name = payload.get("model", "N/A")

    logger.info(f"Sending request to OpenRouter (Model: {model_name})...")

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
            response.raise_for_status() # Raises HTTPStatusError for 4xx/5xx responses

            logger.info(f"Received successful response from OpenRouter (Model: {model_name}).")
            response_data = response.json()

            # Extract content, expecting the structure documented by OpenRouter
            content = response_data.get('choices', [{}])[0].get('message', {}).get('content')
            if content is None:
                logger.error(f"Unexpected response structure from OpenRouter: 'content' field missing.")
                logger.debug(f"Full OpenRouter response: {response_data}")
                raise ValueError("Invalid response format received from AI service (missing content).")

            # The content is expected to be a JSON string based on our request
            logger.debug(f"LLM raw response content type: {type(content)}")
            if not isinstance(content, str):
                 logger.warning(f"LLM response content is not a string: {type(content)}. Attempting conversion.")
                 content = str(content) # Attempt conversion, might fail later if not valid JSON string

            return content

        except httpx.TimeoutException as e:
            logger.error(f"Request to OpenRouter timed out after {timeout}s: {e}")
            raise TimeoutError(f"AI service request timed out after {timeout} seconds.") from e
        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter request failed: {e.response.status_code} - {e.response.text}")
            # Provide specific feedback for common errors
            if e.response.status_code == 401:
                 raise ValueError("Authentication failed. Check your OpenRouter API key.") from e
            elif e.response.status_code == 402:
                 raise ConnectionError("OpenRouter API call failed: Payment required or quota exceeded.") from e
            elif e.response.status_code == 429:
                 raise ConnectionError("OpenRouter API call failed: Rate limit exceeded.") from e
            else:
                 raise ConnectionError(f"AI service request failed with status {e.response.status_code}.") from e
        except httpx.RequestError as e:
            logger.error(f"Network error during OpenRouter request: {e}")
            raise ConnectionError(f"Could not connect to the AI service: {e}") from e
        except Exception as e:
            # Catch any other unexpected errors during the process
            logger.exception(f"An unexpected error occurred in call_llm: {e}")
            raise 