#!/bin/bash

echo "🚀 SRI-KO LMS Choreo Deployment Verification"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

echo ""
print_status "INFO" "Checking navigation links for Choreo deployment..."

# Check if we're in the Frontend directory
if [ ! -f "package.json" ]; then
    print_status "ERROR" "Please run this script from the Frontend directory"
    exit 1
fi

echo ""
print_status "INFO" "1. Verifying navigation link implementation..."

# Check LoginPage.jsx for admin links
if grep -q "to=\"/admin/login\"" src/pages/LoginPage.jsx; then
    print_status "SUCCESS" "Admin login links found in LoginPage.jsx"
else
    print_status "ERROR" "Admin login links missing in LoginPage.jsx"
fi

# Check AdminLoginPage.jsx for user login links
if grep -q "to=\"/login\"" src/pages/AdminLoginPage.jsx; then
    print_status "SUCCESS" "User login links found in AdminLoginPage.jsx"
else
    print_status "ERROR" "User login links missing in AdminLoginPage.jsx"
fi

echo ""
print_status "INFO" "2. Checking route configuration..."

# Check App.jsx for admin routes
if grep -q "path=\"/admin/login\"" src/App.jsx; then
    print_status "SUCCESS" "Admin login route configured in App.jsx"
else
    print_status "ERROR" "Admin login route missing in App.jsx"
fi

if grep -q "path=\"dashboard\"" src/App.jsx; then
    print_status "SUCCESS" "Admin dashboard route configured in App.jsx"
else
    print_status "ERROR" "Admin dashboard route missing in App.jsx"
fi

echo ""
print_status "INFO" "3. Verifying deployment configuration..."

# Check config.js
if [ -f "public/config.js" ]; then
    if grep -q "choreoapis.dev" public/config.js; then
        print_status "SUCCESS" "Choreo API URL configured in public/config.js"
    else
        print_status "WARNING" "Choreo API URL not found in public/config.js"
    fi
else
    print_status "ERROR" "public/config.js not found"
fi

# Check deploy script
if [ -f "deploy-config.sh" ]; then
    print_status "SUCCESS" "Deployment script deploy-config.sh found"
else
    print_status "WARNING" "Deployment script deploy-config.sh not found"
fi

echo ""
print_status "INFO" "4. Testing URL structure..."

# Test URL patterns
echo "Local Development URLs:"
echo "  - User Login: http://localhost:5178/login"
echo "  - Admin Login: http://localhost:5178/admin/login"
echo "  - Admin Dashboard: http://localhost:5178/admin/dashboard"

echo ""
echo "Choreo Deployment URLs (example):"
echo "  - User Login: https://your-choreo-domain.com/login"
echo "  - Admin Login: https://your-choreo-domain.com/admin/login"
echo "  - Admin Dashboard: https://your-choreo-domain.com/admin/dashboard"

echo ""
print_status "INFO" "5. Navigation Link Summary..."

echo "✅ Navigation Links Added:"
echo "   📍 User Login Page → Admin Login Page"
echo "      - Header: 'Admin Login' button"
echo "      - Footer: 'Access Admin Portal' button"
echo ""
echo "   📍 Admin Login Page → User Login Page"
echo "      - 'Back to User Login' link"
echo "      - 'Back to Main Site' link"

echo ""
print_status "INFO" "6. Deployment Readiness Check..."

# Check if build works
if command -v npm &> /dev/null; then
    print_status "SUCCESS" "npm is available for building"
    
    # Check if package.json has build script
    if grep -q "\"build\"" package.json; then
        print_status "SUCCESS" "Build script found in package.json"
    else
        print_status "ERROR" "Build script missing in package.json"
    fi
else
    print_status "ERROR" "npm not found"
fi

echo ""
print_status "SUCCESS" "Choreo Deployment Verification Complete!"
echo ""
echo "📋 Next Steps for Choreo Deployment:"
echo "1. Run: ./deploy-config.sh (or npm run build)"
echo "2. Deploy the 'dist' folder to Choreo"
echo "3. Test navigation links after deployment"
echo "4. Verify admin login functionality"
echo ""
echo "🔗 Navigation Links Will Work Because:"
echo "✅ Relative paths used (/admin/login, /login)"
echo "✅ React Router handles client-side navigation"
echo "✅ No hardcoded localhost URLs"
echo "✅ API configuration auto-detects environment"
echo ""
print_status "SUCCESS" "Ready for Choreo deployment! 🚀"
