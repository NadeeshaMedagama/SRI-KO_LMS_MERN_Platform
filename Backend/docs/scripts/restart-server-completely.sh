#!/bin/bash

echo "🔧 Complete Server Restart Script"
echo "=================================="
echo ""

cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN/Backend

echo "Step 1: Killing all existing node processes..."
pkill -9 -f "node"
sleep 2
echo "✅ All node processes killed"
echo ""

echo "Step 2: Clearing port 5000..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 1
echo "✅ Port cleared"
echo ""

echo "Step 3: Verifying code changes..."
if grep -q "Count ALL completions" routes/adminRoutes.js; then
    echo "✅ Analytics endpoint updated"
else
    echo "❌ Analytics endpoint NOT updated - check routes/adminRoutes.js"
fi

if grep -q "pre('save'" models/Progress.js; then
    echo "✅ Progress middleware found"
else
    echo "❌ Progress middleware NOT found - check models/Progress.js"
fi
echo ""

echo "Step 4: Starting server..."
echo "=================================="
nohup npm start > /tmp/lms-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
echo ""

echo "Waiting for server to start..."
sleep 5

echo ""
echo "Step 5: Checking server status..."
tail -20 /tmp/lms-server.log
echo ""

if curl -s http://localhost:5000/api > /dev/null 2>&1; then
    echo "✅ Server is running and responding!"
    echo ""
    echo "==========================================  "
    echo "🎉 Server started successfully!"
    echo "==========================================  "
    echo ""
    echo "Now:"
    echo "1. Open browser"
    echo "2. Clear cache (Ctrl+Shift+R)"
    echo "3. Login as admin"
    echo "4. Go to Analytics page"
    echo "5. Should show 6 completions"
    echo ""
else
    echo "❌ Server not responding"
    echo "Check logs: tail -f /tmp/lms-server.log"
fi

