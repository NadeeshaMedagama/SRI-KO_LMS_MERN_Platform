#!/bin/bash

echo "🧪 Analytics Quick Test"
echo "======================"
echo ""

cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN/Backend

echo "1️⃣  Testing database calculation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node test-scripts/test-direct-calculation.js | tail -15

echo ""
echo "2️⃣  Checking if backend is running..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ps aux | grep "node server.js" | grep -v grep > /dev/null; then
    PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | head -1)
    echo "✅ Backend is running (PID: $PID)"
    echo "   Logs: tail -f /tmp/backend.log"
else
    echo "❌ Backend is NOT running!"
    echo ""
    echo "   Start it with:"
    echo "   cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN/Backend"
    echo "   node server.js"
fi

echo ""
echo "3️⃣  Expected Analytics Values:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Total Users: 21 (+9.5%)"
echo "   Total Courses: 8 (+12.5%)"
echo "   Total Revenue: LKR 15,029.99 (+0.0%)"
echo "   Active Users: 21 (+9.5%)"
echo ""

echo "4️⃣  Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   1. Clear browser cache (Ctrl+Shift+R)"
echo "   2. Or use incognito window"
echo "   3. Open Analytics page"
echo "   4. Check F12 Network tab Response"
echo "   5. Should see 9.5%, 12.5%, 0.0%, 9.5%"
echo ""

echo "5️⃣  Test with HTML page (no cache):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Open: file://$(pwd)/test-analytics.html"
echo "   Get token: localStorage.getItem('adminToken')"
echo "   Test the API directly"
echo ""

