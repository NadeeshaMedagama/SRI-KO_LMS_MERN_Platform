#!/bin/bash

echo "🔍 Quick Analytics API Test (No Auth Required)"
echo "=============================================="
echo ""

# Test without authentication to see if the endpoint is working
API_URL="http://localhost:5000/api"

echo "Testing: GET $API_URL/admin/analytics?period=30"
echo ""
echo "⚠️  This will fail if backend is not running or requires auth"
echo ""

# Try to get the response
RESPONSE=$(curl -s -X GET "$API_URL/admin/analytics?period=30" \
  -H "Content-Type: application/json" 2>&1)

echo "Response:"
echo "$RESPONSE" | head -50
echo ""

# Check if backend is running
if [[ $RESPONSE == *"Connection refused"* ]]; then
    echo "❌ Backend is not running!"
    echo "   Start it with: cd Backend && npm run dev"
elif [[ $RESPONSE == *"Unauthorized"* ]] || [[ $RESPONSE == *"Authentication required"* ]]; then
    echo "ℹ️  Backend is running but requires authentication"
    echo "   This is expected - the endpoint needs admin token"
    echo ""
    echo "✅ To test with auth, use test-analytics-api.sh with your admin token"
elif [[ $RESPONSE == *"success"* ]]; then
    echo "✅ Backend is working!"
    echo ""
    echo "Overview data:"
    echo "$RESPONSE" | grep -A 20 "overview"
else
    echo "⚠️  Unexpected response"
fi

echo ""

