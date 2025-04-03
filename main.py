from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers import lesson # Import the lesson router
import uvicorn
import logging
import os # Import os for environment variables
from dotenv import load_dotenv # Import dotenv
import pathlib # To work with paths

# Load .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define the path to the public directory (assuming main.py is in the root)
PUBLIC_DIR = pathlib.Path(__file__).parent / "public"
INDEX_HTML = PUBLIC_DIR / "index.html"

app = FastAPI(
    title="EasyLesson API",
    description="API for generating and managing educational lessons",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="public"), name="static")

# Include routers
app.include_router(lesson.router, prefix="/api/lessons", tags=["lessons"])

@app.get("/")
async def root():
    return {"message": "Welcome to EasyLesson API"}

# --- Static Files --- 
# Mount the entire public directory to be served at the root
# This will automatically handle requests for /js/app.js, /css/styles.css, etc.
app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="static-root")

# --- Catch-all for SPA --- 
# This should come AFTER API routes and specific static file mounts (if any)
# The StaticFiles mount with html=True might handle this, but adding explicitly for robustness
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_index(full_path: str):
    """Serve index.html for SPA routing"""
    logger.info(f"Catch-all route triggered for path: {full_path}, serving index.html")
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    else:
        # Should not happen if public/index.html exists
        return PlainTextResponse("index.html not found!", status_code=404)

if __name__ == "__main__":
    # Read port from environment variable, default to 8080
    # Render provides PORT, Uvicorn reads it automatically if passed via command line
    port = int(os.getenv("PORT", 8080))
    reload_flag = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    
    logger.info(f"Starting EasyStory combined server on port {port}... Reload: {reload_flag}")
    # Render start command should be: uvicorn main:app --host 0.0.0.0 --port $PORT
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_flag) 