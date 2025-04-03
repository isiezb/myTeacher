import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class Database:
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    @property
    def client(self) -> Client:
        if self._client is None:
            self._initialize_client()
        return self._client

    def _initialize_client(self):
        """Initialize the Supabase client with environment variables."""
        try:
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_KEY')

            if not supabase_url or not supabase_key:
                raise ValueError("Supabase URL and key must be set in environment variables")

            self._client = create_client(supabase_url, supabase_key)
            logger.info("Successfully connected to Supabase")
        except Exception as e:
            logger.error(f"Error initializing Supabase client: {str(e)}")
            raise

    def initialize_tables(self):
        """Initialize database tables if they don't exist."""
        try:
            # Check if lessons table exists
            response = self.client.table('lessons').select('*').limit(1).execute()
            logger.info("Lessons table exists and is accessible")
        except Exception as e:
            logger.error(f"Error accessing lessons table: {str(e)}")
            raise

    def create_lesson(self, lesson_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new lesson in the database."""
        try:
            # Add user_id to lesson data if provided
            if user_id:
                lesson_data['user_id'] = user_id

            response = self.client.table('lessons').insert(lesson_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating lesson: {str(e)}")
            raise

    def get_lesson(self, lesson_id: str) -> Dict[str, Any]:
        """Retrieve a lesson by ID."""
        try:
            response = self.client.table('lessons').select('*').eq('id', lesson_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error retrieving lesson: {str(e)}")
            raise

    def update_lesson(self, lesson_id: str, lesson_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing lesson."""
        try:
            response = self.client.table('lessons').update(lesson_data).eq('id', lesson_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating lesson: {str(e)}")
            raise

    def delete_lesson(self, lesson_id: str) -> bool:
        """Delete a lesson by ID."""
        try:
            response = self.client.table('lessons').delete().eq('id', lesson_id).execute()
            return True if response.data else False
        except Exception as e:
            logger.error(f"Error deleting lesson: {str(e)}")
            raise

    def list_lessons(self, user_id: Optional[str] = None, limit: int = 10, offset: int = 0) -> list:
        """List lessons with pagination and optional user filter."""
        try:
            query = self.client.table('lessons').select('*')
            
            # Filter by user_id if provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.order('created_at', desc=True).limit(limit).offset(offset).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error listing lessons: {str(e)}")
            raise

# Create a singleton instance
db = Database() 