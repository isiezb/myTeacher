#!/usr/bin/env bash
# exit on error
set -o errexit

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
echo "Backend dependencies installed."

# Add frontend build steps here if needed in the future
# echo "Building frontend..."
# cd ../frontend
# npm install
# npm run build
# cd .. 
# echo "Frontend built."

echo "Build script finished. 