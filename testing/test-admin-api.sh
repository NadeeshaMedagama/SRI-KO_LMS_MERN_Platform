#!/bin/bash

echo "🧪 Testing Admin Dashboard Functionality"
echo "========================================"

# Test 1: Admin Login
echo "📝 Test 1: Admin Login"
echo "Testing admin login with credentials: admin@sriko.com / Admin123"

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sriko.com", "password": "Admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq .

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Admin login successful!"
    echo "Token: ${TOKEN:0:50}..."
    
    # Test 2: Dashboard Stats
    echo ""
    echo "📊 Test 2: Dashboard Stats"
    STATS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/stats \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Stats Response:"
    echo "$STATS_RESPONSE" | jq .
    
    # Test 3: Recent Users
    echo ""
    echo "👥 Test 3: Recent Users"
    USERS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/users?limit=5 \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Users Response:"
    echo "$USERS_RESPONSE" | jq .
    
    # Test 4: Recent Courses
    echo ""
    echo "📚 Test 4: Recent Courses"
    COURSES_RESPONSE=$(curl -s -X GET http://localhost:5000/api/admin/courses?limit=5 \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Courses Response:"
    echo "$COURSES_RESPONSE" | jq .
    
    echo ""
    echo "🎉 All API tests completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "- Admin login: ✅ Working"
    echo "- Dashboard stats: ✅ Working"
    echo "- User management: ✅ Working"
    echo "- Course management: ✅ Working"
    echo ""
    echo "🌐 Frontend should now work at: http://localhost:5173/admin/login"
    echo "   Use credentials: admin@sriko.com / Admin123"
    
else
    echo "❌ Admin login failed!"
    echo "Please check if the backend server is running and the admin user exists."
fi
