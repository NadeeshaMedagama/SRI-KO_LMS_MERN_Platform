#!/bin/bash

echo "🚀 Starting SRI-KO LMS Platform..."
echo "=================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB might not be running."
    echo "   Please start MongoDB before running the application."
    echo ""
fi

# Check if both directories exist and have package.json
if [ ! -f "Backend/package.json" ]; then
    echo "❤️  Backend package.json not found. Please check your setup."
    exit 1
fi

if [ ! -f "Frontend/package.json" ]; then
    echo "❤️  Frontend package.json not found. Please check your setup."
    exit 1
fi

# Create .env files if they don't exist
if [ ! -f "Backend/.env" ]; then
    echo "📝 Creating Backend .env file from template..."
    cp Backend/env.example Backend/.env
    echo "   Please edit Backend/.env with your configuration."
fi

if [ ! -f "Frontend/.env" ]; then
    echo "📝 Creating Frontend .env file from template..."
    cp Frontend/env.example Frontend/.env
    echo "   Please edit Frontend/.env with your configuration."
fi

echo ""
echo "🌟 Starting both servers..."
echo "   Backend API: http://localhost:5000"
echo "   Frontend App: http://localhost:5173"
echo "   API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev

