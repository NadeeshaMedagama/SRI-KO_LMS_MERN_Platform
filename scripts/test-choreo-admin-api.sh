#!/bin/bash

# Test script for Choreo Admin API endpoints
# Usage: ./test-choreo-admin-api.sh

CHOREO_BASE_URL="https://5132b0af-001d-469a-a620-441177beb2a7.e1-us-east-azure.choreoapps.dev"

echo "🧪 Testing Choreo Admin API Endpoints"
echo "======================================"
echo "Base URL: $CHOREO_BASE_URL"
echo ""

# Test basic API health
echo "1. Testing basic API health..."
curl -s "$CHOREO_BASE_URL/choreo-apis/sri-ko-lms-platform/backend/v1/api/health" | jq '.' || echo "❌ Health check failed"
echo ""

# Test admin test endpoint
echo "2. Testing admin test endpoint..."
curl -s "$CHOREO_BASE_URL/choreo-apis/sri-ko-lms-platform/backend/v1/api/admin/test" | jq '.' || echo "❌ Admin test failed"
echo ""

# Test admin stats endpoint (will likely fail due to auth, but should not be 404)
echo "3. Testing admin stats endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CHOREO_BASE_URL/choreo-apis/sri-ko-lms-platform/backend/v1/api/admin/stats")
echo "Status Code: $STATUS"
if [ "$STATUS" = "404" ]; then
    echo "❌ Admin stats endpoint returns 404 - routing issue"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo "✅ Admin stats endpoint found (auth required)"
else
    echo "✅ Admin stats endpoint accessible (status: $STATUS)"
fi
echo ""

# Test admin courses endpoint
echo "4. Testing admin courses endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$CHOREO_BASE_URL/choreo-apis/sri-ko-lms-platform/backend/v1/api/admin/courses")
echo "Status Code: $STATUS"
if [ "$STATUS" = "404" ]; then
    echo "❌ Admin courses endpoint returns 404 - routing issue"
elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo "✅ Admin courses endpoint found (auth required)"
else
    echo "✅ Admin courses endpoint accessible (status: $STATUS)"
fi
echo ""

echo "🏁 Test completed!"
echo ""
echo "Expected results:"
echo "- Health check: 200 OK"
echo "- Admin test: 200 OK"
echo "- Admin stats: 401/403 (auth required, not 404)"
echo "- Admin courses: 401/403 (auth required, not 404)"


