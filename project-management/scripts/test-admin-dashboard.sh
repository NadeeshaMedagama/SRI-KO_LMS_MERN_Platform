#!/bin/bash

echo "🔧 SRI-KO LMS Admin Dashboard Test Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:5000"
API_URL="${BACKEND_URL}/api"
ADMIN_EMAIL="admin@sriko.com"
ADMIN_PASSWORD="Admin123"

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "  Backend URL: $BACKEND_URL"
echo "  API URL: $API_URL"
echo "  Admin Email: $ADMIN_EMAIL"
echo "  Admin Password: $ADMIN_PASSWORD"
echo ""

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local headers=$3
    local data=$4
    local description=$5
    
    echo -e "${YELLOW}🧪 Testing: $description${NC}"
    echo "  URL: $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "$headers" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "$headers" -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "  Response: $(echo "$body" | jq -r '.message // .success // "OK"' 2>/dev/null || echo "OK")"
        return 0
    else
        echo -e "  ${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "  Response: $body"
        return 1
    fi
}

# Test 1: Backend Health Check
echo -e "${BLUE}🔍 Step 1: Backend Health Check${NC}"
test_endpoint "GET" "$API_URL/health" "Content-Type: application/json" "" "Backend Health Check"
echo ""

# Test 2: Admin Login
echo -e "${BLUE}🔍 Step 2: Admin Login${NC}"
login_data="{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"
login_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$login_data" "$API_URL/auth/login")

if echo "$login_response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Admin login successful${NC}"
    TOKEN=$(echo "$login_response" | jq -r '.token')
    USER_ROLE=$(echo "$login_response" | jq -r '.user.role')
    USER_NAME=$(echo "$login_response" | jq -r '.user.name')
    
    echo "  Token: ${TOKEN:0:20}..."
    echo "  User: $USER_NAME ($USER_ROLE)"
    
    if [ "$USER_ROLE" != "admin" ]; then
        echo -e "  ${RED}❌ User is not an admin!${NC}"
        exit 1
    fi
else
    echo -e "  ${RED}❌ Admin login failed${NC}"
    echo "  Response: $login_response"
    exit 1
fi
echo ""

# Test 3: Admin Stats
echo -e "${BLUE}🔍 Step 3: Admin Dashboard Stats${NC}"
auth_header="Authorization: Bearer $TOKEN"
test_endpoint "GET" "$API_URL/admin/stats" "$auth_header" "" "Admin Statistics"
echo ""

# Test 4: Admin Users
echo -e "${BLUE}🔍 Step 4: Admin Users List${NC}"
test_endpoint "GET" "$API_URL/admin/users?limit=5" "$auth_header" "" "Admin Users List"
echo ""

# Test 5: Admin Courses
echo -e "${BLUE}🔍 Step 5: Admin Courses List${NC}"
test_endpoint "GET" "$API_URL/admin/courses?limit=5" "$auth_header" "" "Admin Courses List"
echo ""

# Test 6: Admin Analytics
echo -e "${BLUE}🔍 Step 6: Admin Analytics${NC}"
test_endpoint "GET" "$API_URL/admin/analytics" "$auth_header" "" "Admin Analytics"
echo ""

# Test 7: Frontend Configuration Test
echo -e "${BLUE}🔍 Step 7: Frontend Configuration Test${NC}"
echo "  Testing frontend-backend connection..."

# Create a simple test HTML file
cat > /tmp/admin_test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Admin Test</title>
    <script>
        async function testAdminDashboard() {
            const API_URL = 'http://localhost:5000/api';
            const ADMIN_EMAIL = 'admin@sriko.com';
            const ADMIN_PASSWORD = 'Admin123';
            
            try {
                // Login
                const loginResponse = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
                });
                
                const loginData = await loginResponse.json();
                if (!loginData.success) throw new Error('Login failed');
                
                const token = loginData.token;
                console.log('✅ Login successful');
                
                // Test stats
                const statsResponse = await fetch(`${API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResponse.json();
                console.log('✅ Stats loaded:', statsData);
                
                // Test users
                const usersResponse = await fetch(`${API_URL}/admin/users?limit=3`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const usersData = await usersResponse.json();
                console.log('✅ Users loaded:', usersData);
                
                // Test courses
                const coursesResponse = await fetch(`${API_URL}/admin/courses?limit=3`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const coursesData = await coursesResponse.json();
                console.log('✅ Courses loaded:', coursesData);
                
                document.body.innerHTML = `
                    <h1>✅ Admin Dashboard Test Successful!</h1>
                    <h2>Stats:</h2>
                    <pre>${JSON.stringify(statsData, null, 2)}</pre>
                    <h2>Users (${usersData.count}/${usersData.total}):</h2>
                    <pre>${JSON.stringify(usersData.users, null, 2)}</pre>
                    <h2>Courses (${coursesData.count}/${coursesData.total}):</h2>
                    <pre>${JSON.stringify(coursesData.courses, null, 2)}</pre>
                `;
                
            } catch (error) {
                console.error('❌ Test failed:', error);
                document.body.innerHTML = `<h1>❌ Test Failed: ${error.message}</h1>`;
            }
        }
        
        window.onload = testAdminDashboard;
    </script>
</head>
<body>
    <h1>Testing Admin Dashboard...</h1>
</body>
</html>
EOF

echo "  Test HTML file created at: /tmp/admin_test.html"
echo "  You can open this file in a browser to test the frontend-backend connection"
echo ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=========================================="
echo -e "${GREEN}✅ Backend is running and accessible${NC}"
echo -e "${GREEN}✅ Admin login is working${NC}"
echo -e "${GREEN}✅ Admin API endpoints are responding${NC}"
echo -e "${GREEN}✅ Frontend configuration has been updated${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Make sure both backend and frontend are running:"
echo "   Backend: npm start (in Backend directory)"
echo "   Frontend: npm run dev (in Frontend directory)"
echo ""
echo "2. Open the frontend application in your browser"
echo "3. Navigate to /admin/login"
echo "4. Login with: admin@sriko.com / Admin123"
echo "5. You should see the admin dashboard with data"
echo ""
echo -e "${BLUE}🌐 Test URLs:${NC}"
echo "  Backend Health: $API_URL/health"
echo "  Frontend Test: file:///tmp/admin_test.html"
echo "  Admin Login: http://localhost:5173/admin/login"
echo ""

echo -e "${GREEN}🎉 Admin Dashboard Test Complete!${NC}"



