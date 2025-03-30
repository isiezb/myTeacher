#!/usr/bin/env bash
# start.sh - Start script for Render deployment

echo "Starting FastAPI application with Uvicorn..."
uvicorn main:app --host 0.0.0.0 --port $PORT 