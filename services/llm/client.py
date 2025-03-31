"""
OpenRouter API client for handling LLM requests.

This module provides a unified interface for interacting with the OpenRouter API,
which gives access to various LLM models.
"""

import os
import json
import httpx
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API settings
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

def get_api_key() -> str:
    """Get the API key and validate it exists."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable not set.")
    return OPENROUTER_API_KEY

def get_headers() -> Dict[str, str]:
    """Build the common headers needed for API requests."""
    return {
        "Authorization": f"Bearer {get_api_key()}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",  # Optional, replace with your site URL
        "X-Title": "EasyStory",  # Optional, replace with your app name
    }

def build_payload(system_prompt: str, user_prompt: str, model: Optional[str] = None) -> Dict[str, Any]:
    """Build the request payload for OpenRouter."""
    return {
        "model": model or OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"}  # Request JSON output
    }

async def send_request(payload: Dict[str, Any], timeout: float = 60.0) -> Dict[str, Any]:
    """
    Send a request to the OpenRouter API and handle common errors.
    
    Args:
        payload: The request payload
        timeout: Request timeout in seconds
        
    Returns:
        Parsed JSON response
        
    Raises:
        ValueError: For API key issues or parsing problems
        Exception: For network or API errors
    """
    headers = get_headers()
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            model_name = payload.get("model", OPENROUTER_MODEL)
            print(f"--- Sending request to OpenRouter (Model: {model_name}) ---")
            
            response = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            print("--- Received response from OpenRouter ---")
            return response.json()
            
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
            raise Exception(f"LLM API request failed with status {e.response.status_code}.") from e
        except httpx.RequestError as e:
            print(f"An error occurred while requesting {e.request.url!r}.")
            raise Exception("Could not connect to the LLM API.") from e

async def generate_content(system_prompt: str, user_prompt: str, 
                           model: Optional[str] = None, timeout: float = 60.0) -> str:
    """
    Generate content using the LLM.
    
    Args:
        system_prompt: The system instructions
        user_prompt: The user prompt/request
        model: Optional model override
        timeout: Request timeout in seconds
        
    Returns:
        The generated content as a string
        
    Raises:
        ValueError: For content parsing issues
        Exception: For API or network errors
    """
    payload = build_payload(system_prompt, user_prompt, model)
    response_data = await send_request(payload, timeout)
    
    try:
        result_json_str = response_data['choices'][0]['message']['content']
        return result_json_str
    except (KeyError, IndexError) as e:
        print(f"Error extracting content from response: {e}")
        print(f"Response structure: {response_data}")
        raise ValueError("Unexpected response format from OpenRouter API")
    except Exception as e:
        print(f"Unexpected error processing response: {e}")
        raise 