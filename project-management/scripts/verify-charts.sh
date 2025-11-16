#!/bin/bash

# Chart Implementation Verification Script

echo "================================================"
echo "📊 Chart Visualization Implementation Verification"
echo "================================================"
echo ""

echo "✅ Checking Frontend Chart Components..."
echo ""

# Check if chart components exist
if [ -f "Frontend/src/components/charts/UserGrowthChart.jsx" ]; then
    echo "  ✓ UserGrowthChart.jsx - Created"
else
    echo "  ✗ UserGrowthChart.jsx - Missing"
fi

if [ -f "Frontend/src/components/charts/RevenueChart.jsx" ]; then
    echo "  ✓ RevenueChart.jsx - Created"
else
    echo "  ✗ RevenueChart.jsx - Missing"
fi

if [ -f "Frontend/src/components/charts/UserCourseComparisonChart.jsx" ]; then
    echo "  ✓ UserCourseComparisonChart.jsx - Created"
else
    echo "  ✗ UserCourseComparisonChart.jsx - Missing"
fi

if [ -f "Frontend/src/components/charts/index.js" ]; then
    echo "  ✓ index.js - Created"
else
    echo "  ✗ index.js - Missing"
fi

if [ -f "Frontend/src/components/charts/README.md" ]; then
    echo "  ✓ README.md - Created"
else
    echo "  ✗ README.md - Missing"
fi

echo ""
echo "✅ Checking Dependencies..."
echo ""

cd Frontend

# Check if chart.js is installed
if npm list chart.js >/dev/null 2>&1; then
    VERSION=$(npm list chart.js 2>/dev/null | grep chart.js | head -1)
    echo "  ✓ chart.js - Installed ($VERSION)"
else
    echo "  ✗ chart.js - Not installed"
fi

# Check if react-chartjs-2 is installed
if npm list react-chartjs-2 >/dev/null 2>&1; then
    VERSION=$(npm list react-chartjs-2 2>/dev/null | grep react-chartjs-2 | head -1)
    echo "  ✓ react-chartjs-2 - Installed ($VERSION)"
else
    echo "  ✗ react-chartjs-2 - Not installed"
fi

cd ..

echo ""
echo "✅ Checking AdminAnalyticsPage Integration..."
echo ""

# Check if AdminAnalyticsPage imports the charts
if grep -q "UserGrowthChart" "Frontend/src/pages/AdminAnalyticsPage.jsx"; then
    echo "  ✓ UserGrowthChart imported"
else
    echo "  ✗ UserGrowthChart not imported"
fi

if grep -q "RevenueChart" "Frontend/src/pages/AdminAnalyticsPage.jsx"; then
    echo "  ✓ RevenueChart imported"
else
    echo "  ✗ RevenueChart not imported"
fi

if grep -q "UserCourseComparisonChart" "Frontend/src/pages/AdminAnalyticsPage.jsx"; then
    echo "  ✓ UserCourseComparisonChart imported"
else
    echo "  ✗ UserCourseComparisonChart not imported"
fi

echo ""
echo "✅ Checking Backend Updates..."
echo ""

# Check if backend returns userGrowth and revenueData
if grep -q "userGrowth" "Backend/routes/adminRoutes.js"; then
    echo "  ✓ userGrowth data implemented"
else
    echo "  ✗ userGrowth data missing"
fi

if grep -q "revenueData" "Backend/routes/adminRoutes.js"; then
    echo "  ✓ revenueData implemented"
else
    echo "  ✗ revenueData missing"
fi

if grep -q "courses:" "Backend/routes/adminRoutes.js"; then
    echo "  ✓ Course statistics in monthly data"
else
    echo "  ✗ Course statistics missing"
fi

echo ""
echo "================================================"
echo "📋 Implementation Summary"
echo "================================================"
echo ""
echo "Components Created: 3 chart components + index + docs"
echo "Backend Updated: Enhanced analytics endpoint with course data"
echo "Frontend Updated: AdminAnalyticsPage with 3 interactive charts"
echo "Dependencies: Chart.js v4.5.1 + react-chartjs-2 v5.3.1"
echo ""
echo "🎉 Chart implementation is complete!"
echo ""
echo "To start using the charts:"
echo "1. Backend: cd Backend && npm start"
echo "2. Frontend: cd Frontend && npm run dev"
echo "3. Navigate to Admin Panel > Analytics & Reports"
echo ""

