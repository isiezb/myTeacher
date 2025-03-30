from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import story # Import the story router
import uvicorn
import logging
import os # Import os for environment variables
from dotenv import load_dotenv # Import dotenv

# Load .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="EasyStory API",
    description="API for generating educational stories using OpenRouter",
    version="1.0.0",
)

# Configure CORS
# Get allowed origins from environment variable, split by comma, default to localhost and deployed frontend
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:8000,https://easystory.onrender.com")
origins = [origin.strip() for origin in allowed_origins_str.split(',') if origin.strip()]

logger.info(f"Configuring CORS for origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Include routers
app.include_router(story.router)

@app.get("/status", tags=["health"])
async def read_status():
    """Check API status"""
    logger.info("Status check requested")
    return {"status": "ok", "message": "API is running"}

if __name__ == "__main__":
    # Read port from environment variable, default to 8080
    port = int(os.getenv("PORT", 8080))
    reload_flag = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    
    logger.info(f"Starting EasyStory API server on port {port}... Reload: {reload_flag}")
    # Run with: uvicorn main:app --host 0.0.0.0 --port 8080 --reload (for development)
    # Render start command should be: uvicorn main:app --host 0.0.0.0 --port $PORT
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_flag) 