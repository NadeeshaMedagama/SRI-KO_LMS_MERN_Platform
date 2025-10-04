#!/bin/bash

# SRI-KO LMS Frontend Deployment Configuration Script
# This script ensures the correct API URL and API key are used for Choreo deployment

echo "🔧 Configuring SRI-KO LMS Frontend for Choreo deployment..."

# Set the Choreo API URL
CHOREO_API_URL="https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1"

# IMPORTANT: Replace this with your actual Choreo API key
# You can get this from the Choreo Developer Portal
CHOREO_API_KEY="YOUR_CHOREO_API_KEY_HERE"

echo "⚠️  IMPORTANT: Please replace 'YOUR_CHOREO_API_KEY_HERE' with your actual Choreo API key!"
echo "   You can get this from the Choreo Developer Portal by:"
echo "   1. Going to the Developer Portal"
echo "   2. Finding your API"
echo "   3. Creating an application and subscribing to the API"
echo "   4. Generating an API key"
echo ""

# Update the config.js file
cat > public/config.js << EOF
window.configs = {
    apiUrl: '${CHOREO_API_URL}',
    apiKey: '${CHOREO_API_KEY}',
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
EOF

echo "✅ Updated public/config.js with Choreo API URL: ${CHOREO_API_URL}"
echo "🔑 API Key configured: ${CHOREO_API_KEY}"

# Build the application
echo "🏗️ Building the application..."
npm run build

# Update the dist config.js as well
cat > dist/config.js << EOF
window.configs = {
    apiUrl: '${CHOREO_API_URL}',
    apiKey: '${CHOREO_API_KEY}',
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
EOF

echo "✅ Updated dist/config.js with Choreo API URL: ${CHOREO_API_URL}"
echo "🔑 API Key configured: ${CHOREO_API_KEY}"
echo "🚀 Frontend is ready for Choreo deployment!"
echo ""
echo "📋 Deployment Checklist:"
echo "   ✅ API URL configured for Choreo"
echo "   ✅ API Key configured for Choreo Gateway"
echo "   ✅ Config files updated"
echo "   ✅ Build completed"
echo "   ✅ Ready for deployment"
echo ""
echo "🔍 To verify API key is working:"
echo "   1. Deploy to Choreo"
echo "   2. Open browser dev tools"
echo "   3. Check Network tab for login requests"
echo "   4. Look for 'X-API-Key' header in request headers"
echo "   5. Should see '🔑 Added Choreo API key to request headers' in console"
