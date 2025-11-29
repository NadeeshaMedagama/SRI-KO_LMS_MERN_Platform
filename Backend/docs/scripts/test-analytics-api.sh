#!/bin/bash

# Test Analytics API
# This script tests the analytics endpoint to verify the fix

echo "🧪 Testing Analytics API"
echo "========================"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000/api 2>&1 | grep -q "success\|Cannot"; then
    echo "❌ Server doesn't appear to be running on port 5000"
    echo "   Please start the server first: npm start"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Get admin credentials from user
echo "Please provide admin credentials to test:"
read -p "Email: " ADMIN_EMAIL
read -sp "Password: " ADMIN_PASSWORD
echo ""
echo ""

# Login and get token
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"
echo ""

# Call analytics endpoint
echo "📊 Fetching analytics..."
echo ""

ANALYTICS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Parse and display relevant data
echo "=== ANALYTICS RESPONSE ==="
echo ""

# Extract course completions
COMPLETIONS=$(echo $ANALYTICS_RESPONSE | grep -o '"courseCompletionsThisMonth":[0-9]*' | sed 's/"courseCompletionsThisMonth"://')
GROWTH=$(echo $ANALYTICS_RESPONSE | grep -o '"courseCompletionsGrowth":[0-9.-]*' | sed 's/"courseCompletionsGrowth"://')

if [ -n "$COMPLETIONS" ]; then
    echo "✅ Course Completions This Month: $COMPLETIONS"
    echo "✅ Growth: $GROWTH%"
    echo ""

    if [ "$COMPLETIONS" -eq 0 ]; then
        echo "⚠️  WARNING: Still showing 0 completions!"
        echo "   This might mean:"
        echo "   1. Server hasn't been restarted with new code"
        echo "   2. No completionDate in database records"
        echo "   3. Completions are in a different month"
        echo ""
        echo "   Try running: ./quick-fix-analytics.sh"
    else
        echo "🎉 SUCCESS! Analytics is working correctly!"
        echo ""
        echo "The fix has been applied successfully."
        echo "Your analytics page should now show the correct data."
    fi
else
    echo "❌ Could not parse analytics response"
    echo "Full response:"
    echo $ANALYTICS_RESPONSE | python3 -m json.tool 2>/dev/null || echo $ANALYTICS_RESPONSE
fi

echo ""
echo "========================"
echo "Test complete"

