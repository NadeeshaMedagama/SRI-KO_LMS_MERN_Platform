#!/bin/bash

# SPA Routing Fix Deployment Script for Choreo
# This script builds and prepares the frontend for deployment with SPA routing support

echo "🚀 Building SRI-KO LMS Frontend with SPA Routing Fix..."

# Build the project
echo "📦 Building project..."
npm run build

# Verify _redirects file exists
if [ -f "dist/_redirects" ]; then
    echo "✅ _redirects file found in dist folder"
    echo "📄 Contents of _redirects file:"
    cat dist/_redirects
else
    echo "❌ _redirects file not found in dist folder"
    exit 1
fi

# Verify index.html exists
if [ -f "dist/index.html" ]; then
    echo "✅ index.html found in dist folder"
else
    echo "❌ index.html not found in dist folder"
    exit 1
fi

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps for Choreo deployment:"
echo "1. Upload the contents of the 'dist' folder to your Choreo frontend service"
echo "2. Ensure the _redirects file is in the root of your deployed files"
echo "3. Test the following URLs after deployment:"
echo "   - https://your-choreo-url.com/ (should work)"
echo "   - https://your-choreo-url.com/dashboard (should work after refresh)"
echo "   - https://your-choreo-url.com/courses (should work after refresh)"
echo "   - https://your-choreo-url.com/profile (should work after refresh)"
echo ""
echo "🔧 The _redirects file will tell Choreo to serve index.html for all routes,"
echo "   allowing React Router to handle client-side routing properly."
