#!/bin/bash

# Choreo API Connectivity Test Script
echo "🔍 Testing Choreo API Connectivity..."

# Test the main Choreo API endpoint
CHOREO_API_URL="https://sri-ko-lms-api.choreo.dev"

echo "📡 Testing API Health Check..."
curl -s -o /dev/null -w "Health Check: %{http_code}\n" "${CHOREO_API_URL}/health"

echo "📡 Testing API Health Check with /api prefix..."
curl -s -o /dev/null -w "API Health Check: %{http_code}\n" "${CHOREO_API_URL}/api/health"

echo "📡 Testing API Test Endpoint..."
curl -s -o /dev/null -w "API Test: %{http_code}\n" "${CHOREO_API_URL}/api/test"

echo "📡 Testing Admin Test Endpoint..."
curl -s -o /dev/null -w "Admin Test: %{http_code}\n" "${CHOREO_API_URL}/api/admin/test"

echo "📡 Testing Auth Endpoint..."
curl -s -o /dev/null -w "Auth Endpoint: %{http_code}\n" "${CHOREO_API_URL}/api/auth/login"

echo "📡 Testing Courses Endpoint..."
curl -s -o /dev/null -w "Courses Endpoint: %{http_code}\n" "${CHOREO_API_URL}/api/courses"

echo "📡 Testing Payments Stats Endpoint..."
curl -s -o /dev/null -w "Payments Stats: %{http_code}\n" "${CHOREO_API_URL}/api/payments/stats"

echo "📡 Testing Subscriptions Endpoint..."
curl -s -o /dev/null -w "Subscriptions: %{http_code}\n" "${CHOREO_API_URL}/api/subscriptions/plans"

echo ""
echo "🔍 Detailed Health Check Response:"
curl -s "${CHOREO_API_URL}/api/health" | jq '.' 2>/dev/null || curl -s "${CHOREO_API_URL}/api/health"

echo ""
echo "🔍 Detailed Test Response:"
curl -s "${CHOREO_API_URL}/api/test" | jq '.' 2>/dev/null || curl -s "${CHOREO_API_URL}/api/test"

echo ""
echo "✅ Choreo API connectivity test completed!"
