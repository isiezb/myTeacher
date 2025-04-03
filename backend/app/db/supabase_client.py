import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

logger = logging.getLogger(__name__)

# Load .env file from the backend directory (two levels up from db)
dotenv_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

_supabase_client: Client | None = None


# Mock Supabase client for when no connection is available
def create_mock_client(url):
    """Creates a basic mock client that returns empty results instead of erroring."""
    from unittest.mock import MagicMock
    
    # Create a mock response object similar to what Supabase would return
    mock_response = MagicMock()
    mock_response.data = []  # Empty data
    mock_response.count = 0  # No records
    
    # Create the mock client
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.execute.return_value = mock_response
    mock_client.table.return_value.insert.return_value.execute.return_value = mock_response
    mock_client.table.return_value.update.return_value.execute.return_value = mock_response
    mock_client.table.return_value.delete.return_value.execute.return_value = mock_response
    
    # Add special method to tell if this is a mock
    mock_client.is_mock = True
    
    logger.warning(f"Using MOCK Supabase client for URL: {url}")
    return mock_client

def get_supabase_client(mock_if_unavailable=True) -> Client:
    """Initializes and returns a Supabase client instance using service key.

    Args:
        mock_if_unavailable: If True, return a mock client when Supabase is unavailable

    Returns:
        A configured Supabase client or mock client instance.
    """
    """Initializes and returns a Supabase client instance using service key.

    Uses a simple singleton pattern to avoid recreating the client on every call.

    Raises:
        ValueError: If Supabase URL or Service Key environment variables are not set.

    Returns:
        A configured Supabase client instance.
    """
    global _supabase_client

    if _supabase_client is None:
        logger.info("Initializing Supabase client...")
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") # Use the service key

        if not supabase_url:
            logger.error("SUPABASE_URL environment variable not set.")
            if mock_if_unavailable:
                logger.warning("SUPABASE_URL not set. Using mock client.")
                return create_mock_client("https://example.supabase.co")
            raise ValueError("SUPABASE_URL environment variable not set.")
        if not supabase_key:
            logger.error("SUPABASE_SERVICE_KEY environment variable not set.")
            if mock_if_unavailable:
                logger.warning("SUPABASE_SERVICE_KEY not set. Using mock client.")
                return create_mock_client(supabase_url or "https://example.supabase.co")
            raise ValueError("SUPABASE_SERVICE_KEY environment variable not set.")

        try:
            _supabase_client = create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}", exc_info=True)
            raise RuntimeError(f"Failed to initialize Supabase client: {e}") from e

    return _supabase_client

# Optional: Function to explicitly close the client if needed (e.g., during app shutdown)
async def close_supabase_client():
    global _supabase_client
    if _supabase_client:
        try:
            # Supabase-py client doesn't have an explicit close method for the HTTP client currently.
            # If using realtime, you might close that connection:
            # await _supabase_client.realtime.close()
            logger.info("Supabase client connection closing (placeholder - no explicit close needed for HTTP).")
            _supabase_client = None # Allow reinitialization if needed
        except Exception as e:
            logger.error(f"Error during Supabase client cleanup: {e}", exc_info=True) 