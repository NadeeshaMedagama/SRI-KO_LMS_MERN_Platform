#!/bin/bash

# Choreo Deployment Verification Script
# This script tests the Choreo deployment endpoints to verify the routing fixes are working

echo "🔍 Choreo Deployment Verification Script"
echo "========================================"

# Choreo API base URL
CHOREO_BASE_URL="https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev/choreo-apis/sri-ko-lms-platform/backend/v1"
API_URL="${CHOREO_BASE_URL}/api"

echo "🌐 Testing Choreo API endpoints..."
echo "Base URL: ${CHOREO_BASE_URL}"
echo "API URL: ${API_URL}"
echo ""

# Function to test endpoint
test_endpoint() {
    local url=$1
    local method=${2:-GET}
    local description=$3
    
    echo "Testing: ${description}"
    echo "URL: ${method} ${url}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${url}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "${method}" "${url}")
    fi
    
    http_code=$(echo "${response}" | tail -n1)
    body=$(echo "${response}" | head -n -1)
    
    if [ "${http_code}" = "200" ]; then
        echo "✅ Status: ${http_code} OK"
    elif [ "${http_code}" = "404" ]; then
        echo "❌ Status: ${http_code} Not Found - Backend not deployed or routing issue"
    elif [ "${http_code}" = "401" ]; then
        echo "⚠️  Status: ${http_code} Unauthorized - Expected for protected endpoints"
    else
        echo "⚠️  Status: ${http_code} - ${body}"
    fi
    
    echo "Response: ${body:0:200}..."
    echo "---"
    echo ""
}

# Test health endpoints
echo "🏥 Testing Health Endpoints"
echo "=========================="
test_endpoint "${CHOREO_BASE_URL}/health" "GET" "Basic Health Check"
test_endpoint "${API_URL}/health" "GET" "API Health Check"

# Test database endpoints (should return 401 without auth, not 404)
echo "🗄️  Testing Database Endpoints"
echo "=============================="
test_endpoint "${API_URL}/users/dashboard" "GET" "User Dashboard (should return 401, not 404)"
test_endpoint "${API_URL}/join-us/submit" "POST" "Join Us Form (should return 400/401, not 404)"

# Test static files
echo "🖼️  Testing Static Files"
echo "========================"
test_endpoint "${CHOREO_BASE_URL}/uploads/avatar-1759658474446-704707130.jpeg" "GET" "Avatar Image"

# Test auth endpoints
echo "🔐 Testing Auth Endpoints"
echo "========================"
test_endpoint "${API_URL}/auth/login" "POST" "Login Endpoint (should return 400, not 404)"

echo "📊 Summary"
echo "=========="
echo "✅ 200 OK: Endpoint working correctly"
echo "⚠️  401 Unauthorized: Expected for protected endpoints (authentication required)"
echo "⚠️  400 Bad Request: Expected for endpoints requiring data"
echo "❌ 404 Not Found: Backend not deployed or routing issue"
echo ""
echo "🎯 Expected Results After Deployment:"
echo "   - Health endpoints: 200 OK"
echo "   - Database endpoints: 401 Unauthorized (not 404)"
echo "   - Auth endpoints: 400 Bad Request (not 404)"
echo "   - Static files: 200 OK or 404 (if file doesn't exist)"
echo ""
echo "📝 Next Steps:"
echo "   1. If you see 404 errors, deploy the backend to Choreo"
echo "   2. If you see 401/400 errors, the routing is working correctly"
echo "   3. Test with authentication tokens for full functionality"

