#!/usr/bin/env bash
# exit on error, but not immediately so we can do proper error handling
set -o pipefail

# Print environment information
echo "===== Deployment Environment Info ====="
echo "Working Directory: $(pwd)"
echo "Python Version: $(python --version 2>&1)"
echo "Node Version: $(node --version 2>&1 || echo 'Node.js not installed')"
echo "======================================"

# Check for .env file and copy .env.example if needed
if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  echo "No .env file found in backend directory, creating from .env.example..."
  cp backend/.env.example backend/.env
  echo "You may need to edit backend/.env with your API keys and other settings."
fi

# Run the fix script to address known issues
echo "Running fix_specific.py to address known issues..."
python fix_specific.py

# Run the environment check script
echo "Checking environment variables..."
python env_check.py
ENV_CHECK_RESULT=$?

# Handle environment check failures
if [ $ENV_CHECK_RESULT -ne 0 ]; then
    echo "Environment check failed. Attempting to fix..."
    
    # Default values if not set (for development only)
    if [ -z "$PORT" ]; then
        export PORT=8000
        echo "Set PORT to default: 8000"
    fi
    
    if [ -z "$OPENROUTER_MODEL" ]; then
        export OPENROUTER_MODEL="google/gemini-1.5-flash-latest"
        echo "Set OPENROUTER_MODEL to default: google/gemini-1.5-flash-latest"
    fi
    
    # Re-run the check
    echo "Re-checking environment after applying defaults..."
    python env_check.py
    RECHECK_RESULT=$?
    
    if [ $RECHECK_RESULT -ne 0 ]; then
        echo "Environment check still failing. Please set the missing environment variables."
        echo "For development, you can create a .env file in the backend directory."
        echo "For production deployment, set these in your hosting platform."
        exit 1
    fi
fi

# Initialize database if needed
echo "Initializing database (creating tables if needed)..."
python init_db.py
DB_INIT_RESULT=$?
if [ $DB_INIT_RESULT -ne 0 ]; then
    echo "WARNING: Database initialization failed, but continuing startup"
    echo "The application may not work correctly if tables don't exist."
    # We don't exit here as the application might still work for some functions
fi

echo "Starting backend server..."
cd backend

# Set default PORT if not set (useful for local development)
if [ -z "$PORT" ]; then
    export PORT=8000
    echo "Using default port: 8000"
else
    echo "Using configured port: $PORT"
fi

# Start Uvicorn with appropriate settings
# Start Uvicorn, listening on all interfaces (0.0.0.0) and the port specified by Render ($PORT)
echo "Starting Uvicorn on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
echo "Server stopped." 