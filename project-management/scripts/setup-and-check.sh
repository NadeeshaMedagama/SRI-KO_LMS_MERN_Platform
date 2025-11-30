#!/bin/bash

echo "════════════════════════════════════════════════════"
echo "  🚀 SRI-KO LMS - Complete Startup Script"
echo "════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

echo ""
echo -e "${YELLOW}📋 Step 2: Setting up Backend...${NC}"

cd Backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check config file
if [ ! -f "config.env" ]; then
    echo -e "${RED}❌ config.env not found!${NC}"
    echo "Creating from env.example..."
    cp env.example config.env
    echo -e "${YELLOW}⚠️  Please edit config.env with your settings${NC}"
fi

# Kill any existing process on port 5000
echo "🔍 Checking port 5000..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🔪 Killing existing process on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✅ Port 5000 is available${NC}"

cd ..

echo ""
echo -e "${YELLOW}📋 Step 3: Setting up Frontend...${NC}"

cd Frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Kill any existing process on port 5173
echo "🔍 Checking port 5173..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🔪 Killing existing process on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✅ Port 5173 is available${NC}"

cd ..

echo ""
echo "════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo ""
echo "Option 1: Manual Start (Recommended for debugging)"
echo "  Terminal 1: cd Backend && npm start"
echo "  Terminal 2: cd Frontend && npm run dev"
echo ""
echo "Option 2: Start both in background"
echo "  ./start-all.sh"
echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}📍 URLs after starting:${NC}"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:5000/api"
echo ""
echo "════════════════════════════════════════════════════"

