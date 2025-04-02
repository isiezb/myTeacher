#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running fix_specific.py to address known issues..."
python fix_specific.py

echo "Checking environment variables..."
python env_check.py
if [ $? -ne 0 ]; then
    echo "Environment check failed. Please fix the issues and try again."
    exit 1
fi

echo "Starting backend server..."
cd backend
# Start Uvicorn, listening on all interfaces (0.0.0.0) and the port specified by Render ($PORT)
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
echo "Server stopped." 