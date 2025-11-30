#!/bin/bash

# Test the subscription plans API endpoint

echo "================================"
echo "Testing Subscription Plans API"
echo "================================"
echo ""

# Get the API URL from config
API_URL="${API_URL:-http://localhost:5000}"

echo "API URL: $API_URL"
echo ""

echo "1. Testing GET /api/subscriptions/plans (should work without auth)"
echo "-------------------------------------------------------------------"
curl -X GET "$API_URL/api/subscriptions/plans" \
  -H "Content-Type: application/json" \
  -s | jq '.'

echo ""
echo ""
echo "2. Checking response structure"
echo "-------------------------------------------------------------------"
RESPONSE=$(curl -X GET "$API_URL/api/subscriptions/plans" -H "Content-Type: application/json" -s)
echo "$RESPONSE" | jq '.success'
echo ""
echo "Plans count:"
echo "$RESPONSE" | jq '.data | length'
echo ""
echo "Plan names:"
echo "$RESPONSE" | jq '.data[].name'
echo ""
echo "================================"
echo "Test Complete"
echo "================================"

