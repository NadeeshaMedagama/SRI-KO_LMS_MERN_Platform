# Dashboard Choreo Deployment Fix

## Problem Description

The dashboard page was showing "Not Found" error in Choreo deployment because of incorrect API URL construction.

### Root Cause

1. **Choreo API URL Structure**: 
   ```
   https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1
   ```

2. **Dashboard API Call**: 
   ```javascript
   const response = await fetch(`${baseUrl}/api/users/dashboard`, {
   ```

3. **Resulting Incorrect URL**:
   ```
   https://...choreoapis.dev/sri-ko-lms-platform/backend/v1/api/users/dashboard
   ```

4. **Correct URL Should Be**:
   ```
   https://...choreoapis.dev/sri-ko-lms-platform/backend/v1/users/dashboard
   ```

## Solution Implemented

### 1. Updated `apiConfig.ts`

Created a centralized API configuration that handles both local and Choreo environments:

```typescript
// Read from window.configs if it exists (Choreo deployment)
// Otherwise fall back to local backend URL
const baseUrl = window?.configs?.apiUrl
  ? window.configs.apiUrl
  : "http://localhost:5000"; // local backend

// Handle Choreo API URL structure - it already includes the API path
let apiUrl;
if (baseUrl.includes('choreoapis.dev')) {
  // Choreo API URL already includes the full path, just return baseUrl
  apiUrl = baseUrl;
} else {
  // Local development URL needs /api prefix
  apiUrl = `${baseUrl}/api`;
}

export default apiUrl;
```

### 2. Updated All Frontend Files

Updated all files that make API calls to use the centralized configuration:

- **DashboardPage.jsx** - Dashboard data loading
- **AuthContext.jsx** - Login and authentication
- **ProfilePage.jsx** - Avatar upload
- **JoinUsPage.jsx** - Form submission
- **AdminDashboardPage.jsx** - Admin statistics
- **AdminUserManagementPage.jsx** - User management
- **AdminAnalyticsPage.jsx** - Analytics data
- **AdminCourseManagementPage.jsx** - Course management

### 3. API Call Pattern

**Before (Incorrect)**:
```javascript
const baseUrl = window?.configs?.apiUrl || 'http://localhost:5000';
const response = await fetch(`${baseUrl}/api/users/dashboard`, {
```

**After (Correct)**:
```javascript
import apiUrl from '../config/apiConfig';
const response = await fetch(`${apiUrl}/users/dashboard`, {
```

## Files Modified

1. `/Frontend/src/config/apiConfig.ts` - Centralized API configuration
2. `/Frontend/src/pages/DashboardPage.jsx` - Dashboard API calls
3. `/Frontend/src/context/AuthContext.jsx` - Authentication API calls
4. `/Frontend/src/pages/ProfilePage.jsx` - Profile API calls
5. `/Frontend/src/pages/JoinUsPage.jsx` - Join us form API calls
6. `/Frontend/src/pages/AdminDashboardPage.jsx` - Admin dashboard API calls
7. `/Frontend/src/pages/AdminUserManagementPage.jsx` - User management API calls
8. `/Frontend/src/pages/AdminAnalyticsPage.jsx` - Analytics API calls
9. `/Frontend/src/pages/AdminCourseManagementPage.jsx` - Course management API calls

## Testing

Created test file: `/testing/debug-tools/dashboard-choreo-fix-test.html`

This test file:
- Simulates the API URL construction logic
- Tests both local and Choreo environments
- Provides visual feedback on URL construction
- Tests actual API calls when authentication token is available

## Deployment Steps

1. **Build the Frontend**:
   ```bash
   cd Frontend
   npm run build
   ```

2. **Deploy to Choreo**:
   - Upload the `dist` folder to Choreo
   - Ensure `config.js` is properly configured

3. **Test Dashboard**:
   - Login to the application
   - Navigate to dashboard
   - Verify data loads correctly

## Backward Compatibility

The solution maintains backward compatibility:
- **Local Development**: Still uses `http://localhost:5000/api/...` URLs
- **Choreo Deployment**: Uses `https://...choreoapis.dev/sri-ko-lms-platform/backend/v1/...` URLs

## Benefits

1. **Centralized Configuration**: All API URLs managed in one place
2. **Environment Detection**: Automatically detects local vs Choreo environment
3. **Maintainable**: Easy to update API URLs for different environments
4. **Consistent**: All components use the same API configuration
5. **Future-Proof**: Easy to add new environments or change URLs

## Verification

After deployment, verify:
- ✅ Dashboard loads without "Not Found" error
- ✅ User statistics display correctly
- ✅ Enrolled courses show properly
- ✅ Recent activity loads
- ✅ All admin pages work correctly
- ✅ Authentication flows properly
- ✅ Profile updates work
- ✅ Form submissions work

The dashboard should now work correctly in both local development and Choreo deployment environments.
