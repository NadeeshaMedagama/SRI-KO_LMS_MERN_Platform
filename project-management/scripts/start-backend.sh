#!/bin/bash

echo "🚀 Starting SRI-KO LMS Backend Server..."
echo "========================================"
echo ""

# Navigate to Backend directory
cd "$(dirname "$0")/Backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f "config.env" ]; then
    echo "⚠️  WARNING: config.env file not found!"
    echo "Please create config.env based on env.example"
    exit 1
fi

# Kill any existing server on port 5000
echo "🔍 Checking for existing server on port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "✅ Port 5000 is clear"
echo ""

# Start the server
echo "🌟 Starting server..."
echo "Backend will be available at: http://localhost:5000"
echo "API endpoints at: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

npm start

