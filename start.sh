#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting backend server..."
cd backend
# Start Uvicorn, listening on all interfaces (0.0.0.0) and the port specified by Render ($PORT)
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1
echo "Server stopped." 