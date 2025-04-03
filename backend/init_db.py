import os
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv
from app.database import db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Initialize the database and apply migrations."""
    try:
        # Load environment variables
        env_path = Path(__file__).parent / '.env'
        load_dotenv(env_path)
        
        logger.info("Loading environment variables from %s", env_path)
        logger.info("Starting database initialization...")
        
        # Initialize Supabase client
        logger.info("Connecting to Supabase...")
        db.initialize_tables()
        
        logger.info("Database initialization completed successfully")
        return 0
        
    except Exception as e:
        logger.error("Error initializing database: %s", str(e))
        logger.error("Database initialization failed")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 