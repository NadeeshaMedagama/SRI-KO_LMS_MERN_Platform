#!/bin/bash

echo "🔧 Complete Backend Restart and Test"
echo "====================================="
echo ""

# Kill any existing node processes
echo "1️⃣  Killing existing node processes..."
pkill -9 -f "node" 2>/dev/null
sleep 2
echo "   ✅ Processes killed"
echo ""

# Start backend in background
echo "2️⃣  Starting backend server..."
cd "$(dirname "$0")/.."
npm run dev > /tmp/lms-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: /tmp/lms-backend.log"
echo ""

# Wait for backend to start
echo "3️⃣  Waiting for backend to start (10 seconds)..."
sleep 10
echo ""

# Check if backend is running
echo "4️⃣  Checking if backend is running..."
if ps -p $BACKEND_PID > /dev/null; then
    echo "   ✅ Backend is running (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend failed to start!"
    echo "   Check logs: tail /tmp/lms-backend.log"
    exit 1
fi
echo ""

# Test health
echo "5️⃣  Testing backend health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 2>/dev/null)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backend is responding (HTTP $HTTP_CODE)"
else
    echo "   ❌ Backend not responding (HTTP $HTTP_CODE)"
    echo "   Check logs: tail /tmp/lms-backend.log"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKEND STARTED SUCCESSFULLY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "   1. Open your browser"
echo "   2. Clear cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   3. Go to Analytics page"
echo "   4. Check the browser console for logs"
echo "   5. Check percentages displayed"
echo ""
echo "📊 Expected values:"
echo "   Total Users: 21 (+9.5%)"
echo "   Total Courses: 8 (+12.5%)"
echo "   Total Revenue: LKR 15,029.99 (+0.0%)"
echo "   Active Users: 21 (+9.5%)"
echo ""
echo "📝 Backend logs: tail -f /tmp/lms-backend.log"
echo "🛑 Stop backend: kill $BACKEND_PID"
echo ""

