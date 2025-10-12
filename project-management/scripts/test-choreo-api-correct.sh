#!/bin/bash

# Choreo API Connectivity Test Script - Updated
echo "🔍 Testing Choreo API Connectivity with correct URL..."

# Test the correct Choreo API endpoint
CHOREO_API_URL="https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev/choreo-apis/sri-ko-lms-platform/backend/v1"

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
echo "🔍 Testing with proper headers:"
curl -s -H "Accept: application/json" -H "Content-Type: application/json" "${CHOREO_API_URL}/api/health" | jq '.' 2>/dev/null || curl -s -H "Accept: application/json" -H "Content-Type: application/json" "${CHOREO_API_URL}/api/health"

echo ""
echo "✅ Choreo API connectivity test completed!"
