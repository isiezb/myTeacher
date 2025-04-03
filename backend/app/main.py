import os
import logging
from pathlib import Path
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from dotenv import load_dotenv
from .routers import lesson_router # Import the lesson router

# --- Configuration ---
# Load .env file from the backend directory (one level up from app)
dotenv_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

# Logging setup
log_level = os.getenv("LOG_LEVEL", "info").upper()
logging.basicConfig(level=log_level, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

# Static files directory (assuming 'static' folder in 'app')
# Vite will build into this directory
STATIC_DIR = Path(__file__).parent / "static"
INDEX_HTML = STATIC_DIR / "index.html"

# CORS Origins
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")
origins = [origin.strip() for origin in allowed_origins_str.split(',') if origin.strip()]

if not origins:
    logger.warning("ALLOWED_ORIGINS environment variable not set. CORS might block frontend requests.")
    # Default to allowing localhost for typical development if not specified
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

logger.info(f"Configuring CORS for origins: {origins}")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="EasyLesson API",
    description="Backend API for the EasyLesson application, serving lesson generation and frontend.",
    version="1.0.0",
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers ---
# Placeholder for API endpoints, prefixed with /api
api_router = APIRouter(prefix="/api")

@api_router.get("/status", tags=["Health"])
async def get_status():
    """Simple health check endpoint."""
    logger.info("API status requested.")
    return {"status": "ok"}

# TODO: Add other routers here (e.g., lessons, auth)
api_router.include_router(lesson_router.router)

app.include_router(api_router)

# --- Static Files & SPA Catch-all ---
# Mount the static directory AFTER the API router
# All requests not matching /api/... will be checked against static files
if STATIC_DIR.exists() and STATIC_DIR.is_dir():
    logger.info(f"Mounting static files from: {STATIC_DIR}")
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets") # Vite assets usually go here
    # Any other top-level static files can be mounted similarly if needed
else:
    logger.warning(f"Static directory {STATIC_DIR} not found. Frontend may not load.")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    """
    Serve the index.html file for all non-API, non-static file paths.
    Needed for Single Page Application (SPA) routing.
    """
    logger.debug(f"SPA catch-all triggered for path: {full_path}")
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    else:
        logger.error(f"index.html not found at {INDEX_HTML}")
        # Return a simple 404 if index.html doesn't exist where expected
        # This usually indicates a build issue or incorrect STATIC_DIR path
        return PlainTextResponse("Application not built or index.html missing.", status_code=404)


# --- Run (for local testing, though usually run via 'uvicorn backend.app.main:app') ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000)) # Default backend port
    reload_flag = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    logger.info(f"Starting Uvicorn server locally on port {port} (Reload: {reload_flag})")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_flag, app_dir=str(Path(__file__).parent))
