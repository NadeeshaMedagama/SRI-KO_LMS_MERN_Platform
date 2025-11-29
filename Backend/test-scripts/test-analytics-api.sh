#!/bin/bash

echo "🧪 Testing Analytics API Endpoints"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get admin token (you'll need to replace this with your actual admin token)
echo "📝 Note: You need an admin token to test these endpoints"
echo "   To get a token, login as admin and check localStorage.getItem('adminToken')"
echo ""

# Check if token is provided as argument
if [ -z "$1" ]; then
    echo "${YELLOW}⚠️  No admin token provided${NC}"
    echo "Usage: ./test-analytics-api.sh <ADMIN_TOKEN>"
    echo ""
    echo "Example:"
    echo "  ./test-analytics-api.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo ""
    exit 1
fi

TOKEN="$1"
API_URL="${2:-http://localhost:5000/api}"

echo "${BLUE}🌐 API URL: $API_URL${NC}"
echo ""

# Test 1: Admin Stats Endpoint
echo "${GREEN}Test 1: Admin Stats (Dashboard)${NC}"
echo "Endpoint: GET /admin/stats"
echo "---"
curl -s -X GET "$API_URL/admin/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

# Test 2: Analytics Endpoint (Last 30 days)
echo "${GREEN}Test 2: Analytics - Last 30 Days${NC}"
echo "Endpoint: GET /admin/analytics?period=30"
echo "---"
curl -s -X GET "$API_URL/admin/analytics?period=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.analytics.overview'
echo ""
echo ""

# Test 3: Analytics Endpoint (Last 7 days)
echo "${GREEN}Test 3: Analytics - Last 7 Days${NC}"
echo "Endpoint: GET /admin/analytics?period=7"
echo "---"
curl -s -X GET "$API_URL/admin/analytics?period=7" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.analytics.overview'
echo ""
echo ""

# Test 4: Analytics Endpoint (Last 90 days)
echo "${GREEN}Test 4: Analytics - Last 90 Days${NC}"
echo "Endpoint: GET /admin/analytics?period=90"
echo "---"
curl -s -X GET "$API_URL/admin/analytics?period=90" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.analytics.overview'
echo ""
echo ""

# Test 5: Analytics for specific year
CURRENT_YEAR=$(date +%Y)
echo "${GREEN}Test 5: Analytics - Year $CURRENT_YEAR${NC}"
echo "Endpoint: GET /admin/analytics?period=30&year=$CURRENT_YEAR"
echo "---"
curl -s -X GET "$API_URL/admin/analytics?period=30&year=$CURRENT_YEAR" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.analytics.overview'
echo ""
echo ""

echo "${BLUE}✅ Tests Complete!${NC}"
echo ""
echo "📊 What to Check:"
echo "   1. totalRevenue should be a real number from your database"
echo "   2. usersGrowth should be: (new users in period / total users) * 100"
echo "   3. coursesGrowth should be: (new courses in period / total courses) * 100"
echo "   4. revenueGrowth should be: (revenue in period / total revenue) * 100"
echo "   5. activeUsersGrowth should be: (new active users / total active users) * 100"
echo ""

