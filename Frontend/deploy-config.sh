#!/bin/bash

# SRI-KO LMS Frontend Deployment Configuration Script
# This script ensures the correct API URL is used for Choreo deployment

echo "🔧 Configuring SRI-KO LMS Frontend for Choreo deployment..."

# Set the Choreo API URL
CHOREO_API_URL="https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1"

# Update the config.js file
cat > public/config.js << EOF
window.configs = {
    apiUrl: '${CHOREO_API_URL}',
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
EOF

echo "✅ Updated public/config.js with Choreo API URL: ${CHOREO_API_URL}"

# Build the application
echo "🏗️ Building the application..."
npm run build

# Update the dist config.js as well
cat > dist/config.js << EOF
window.configs = {
    apiUrl: '${CHOREO_API_URL}',
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
EOF

echo "✅ Updated dist/config.js with Choreo API URL: ${CHOREO_API_URL}"
echo "🚀 Frontend is ready for Choreo deployment!"
echo ""
echo "📋 Deployment Checklist:"
echo "   ✅ API URL configured for Choreo"
echo "   ✅ Config files updated"
echo "   ✅ Build completed"
echo "   ✅ Ready for deployment"
