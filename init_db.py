#!/usr/bin/env python3
"""
Database initialization script for EasyStory.
This script creates the necessary tables in Supabase if they don't exist.
"""

import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("db_init")

# Try to load environment variables
try:
    from dotenv import load_dotenv
    dotenv_path = Path(__file__).parent / "backend" / ".env"
    if dotenv_path.exists():
        logger.info(f"Loading environment variables from {dotenv_path}")
        load_dotenv(dotenv_path=dotenv_path)
    else:
        alt_path = Path(__file__).parent / ".env"
        if alt_path.exists():
            logger.info(f"Loading environment variables from {alt_path}")
            load_dotenv(dotenv_path=alt_path)
except ImportError:
    logger.warning("python-dotenv not installed. Using environment variables as-is.")

# Import Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    logger.error("supabase-py package not installed. Run: pip install supabase")
    sys.exit(1)

def init_database():
    """Initialize the database with required tables"""
    # Get Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
        return False
    
    try:
        # Initialize Supabase client
        logger.info("Connecting to Supabase...")
        client = create_client(supabase_url, supabase_key)
        
        # Create the 'lessons' table if it doesn't exist
        # We're using SQL executed via the Supabase client
        # Note: This requires the service key with admin privileges
        logger.info("Creating tables if they don't exist...")
        
        lessons_table_sql = """
        CREATE TABLE IF NOT EXISTS lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            topic TEXT,
            academic_grade TEXT NOT NULL,
            word_count INTEGER NOT NULL,
            lesson_data JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Create index on subject and topic
        CREATE INDEX IF NOT EXISTS lessons_subject_topic_idx ON lessons(subject, topic);
        """
        
        # Execute the SQL
        client.postgrest.schema("public").execute_sql(lessons_table_sql)
        
        logger.info("Database initialization complete")
        return True
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting database initialization...")
    success = init_database()
    if success:
        logger.info("Database initialization successful")
        sys.exit(0)
    else:
        logger.error("Database initialization failed")
        sys.exit(1) 