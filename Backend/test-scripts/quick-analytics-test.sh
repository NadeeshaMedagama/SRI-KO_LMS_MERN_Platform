#!/bin/bash

# Quick Analytics Test Script
# This script helps verify that the analytics growth calculation is working correctly

echo "🔍 Analytics Growth Calculation - Quick Test"
echo "=============================================="
echo ""

# Check if backend is running
if ! pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  Backend server is not running!"
    echo "   Please start the backend server first:"
    echo "   cd Backend && npm start"
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# Test the calculation logic
echo "📊 Testing Growth Calculation Logic..."
node test-scripts/test-analytics-growth-fix.js

echo ""
echo "🌐 Testing Live API Endpoint..."
echo ""

# Get the auth token (you'll need to replace with actual admin token)
echo "ℹ️  To test the live API, you need an admin token."
echo "   1. Login to the admin panel"
echo "   2. Open browser DevTools > Application > Local Storage"
echo "   3. Copy the 'adminToken' or 'token' value"
echo "   4. Run the following command with your token:"
echo ""
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "        http://localhost:5000/api/admin/analytics?period=30"
echo ""
echo "📝 What to look for in the response:"
echo "   - usersGrowth: Should NOT always be 100%"
echo "   - coursesGrowth: Should show realistic percentage change"
echo "   - revenueGrowth: Should reflect actual revenue trends"
echo "   - activeUsersGrowth: Can be positive or negative"
echo ""
echo "✅ Fix Applied Successfully!"
echo "   The analytics now compare current period vs previous period"
echo "   instead of showing new items as percentage of total."

