# SRI-KO LMS Frontend Deployment Guide

## Issue Resolution: API URL Configuration & Choreo API Gateway Authentication

### Problem Identified
The frontend was making requests to `http://localhost:5000` instead of the Choreo deployment URL, and after fixing that, getting **401 Unauthorized** errors because:

1. **Wrong config.js path**: HTML referenced `/public/config.js` instead of `/config.js`
2. **Property name mismatch**: Config used `window.config` but code expected `window.configs`
3. **Placeholder URL**: The config.js contained a placeholder instead of the actual Choreo URL
4. **Missing API Key**: Choreo API Gateway requires an API key for authentication

### Solution Applied

#### 1. Fixed HTML Configuration Loading
- **File**: `public/index.html`
- **Change**: Updated script src from `/public/config.js` to `/config.js`

#### 2. Fixed Configuration Object
- **File**: `public/config.js`
- **Change**: Updated from `window.config` to `window.configs` to match the expected property name

#### 3. Updated API URL
- **File**: `public/config.js` and `dist/config.js`
- **Change**: Set the correct Choreo API URL:
  ```
  https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1
  ```

#### 4. Added Choreo API Key Support
- **File**: `public/config.js`, `dist/config.js`, `src/types/global.d.ts`, `src/services/apiService.ts`
- **Change**: Added API key configuration and automatic header injection

### Deployment Process

#### Option 1: Use the Deployment Script
```bash
cd Frontend
# IMPORTANT: First, edit deploy-config.sh and replace YOUR_CHOREO_API_KEY_HERE with your actual API key
./deploy-config.sh
```

#### Option 2: Manual Steps
1. **Get your Choreo API Key**:
   - Go to Choreo Developer Portal
   - Find your API
   - Create an application and subscribe to the API
   - Generate an API key

2. **Update configuration files**:
   - Replace `YOUR_CHOREO_API_KEY_HERE` in `public/config.js` with your actual API key
   - Run `npm run build`
   - Replace `YOUR_CHOREO_API_KEY_HERE` in `dist/config.js` with your actual API key

3. **Deploy the `dist` folder** to Choreo

### Verification Steps

1. **Check Network Tab**: After deployment, verify that login requests go to the Choreo URL, not localhost
2. **Check Request Headers**: Look for `X-API-Key` header in the request headers
3. **Console Logs**: Should see "🔑 Added Choreo API key to request headers" in console
4. **Authentication**: Login should work with the deployed backend (no more 401 errors)

### Configuration Files

#### `public/config.js` (Development)
```javascript
window.configs = {
    apiUrl: 'https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1',
    apiKey: 'YOUR_ACTUAL_CHOREO_API_KEY', // Replace with your actual Choreo API key
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
```

#### `dist/config.js` (Production)
```javascript
window.configs = {
    apiUrl: 'https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1',
    apiKey: 'YOUR_ACTUAL_CHOREO_API_KEY', // Replace with your actual Choreo API key
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
```

### API Configuration Logic

The `src/services/apiService.ts` file now includes:
```typescript
// Request interceptor to add auth token and Choreo API key
this.api.interceptors.request.use(
  (config) => {
    // Add Choreo API key if available (for API gateway authentication)
    const choreoApiKey = window?.configs?.apiKey;
    if (choreoApiKey && choreoApiKey !== 'YOUR_CHOREO_API_KEY_HERE') {
      config.headers['X-API-Key'] = choreoApiKey;
      console.log('🔑 Added Choreo API key to request headers');
    }

    // Add JWT token for user authentication
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

This ensures:
- ✅ Production: Uses Choreo URL from `window.configs.apiUrl`
- ✅ Production: Includes Choreo API key in `X-API-Key` header
- ✅ Development: Falls back to localhost:5000
- ✅ Automatic `/api` prefix addition
- ✅ JWT token for user authentication

### Troubleshooting

#### If requests still go to localhost:
1. Check browser cache - clear it completely
2. Verify `config.js` is loaded in Network tab
3. Check console for `window.configs` object
4. Ensure the script tag loads before the main app bundle

#### If you get 401 Unauthorized errors:
1. **Check API Key**: Verify you've replaced `YOUR_CHOREO_API_KEY_HERE` with your actual API key
2. **Check Headers**: Look for `X-API-Key` header in Network tab
3. **Check Console**: Should see "🔑 Added Choreo API key to request headers"
4. **Verify API Key**: Ensure the API key is valid and has proper permissions
5. **Check CORS**: Ensure your frontend URL is allowed in Choreo API settings

#### If you get CORS errors:
1. Check that your frontend URL is included in the CORS origins
2. Verify the API key has the correct referrer restrictions (if any)

### Getting Your Choreo API Key

1. **Access Choreo Developer Portal**:
   - Go to your Choreo organization
   - Navigate to Developer Portal

2. **Find Your API**:
   - Look for "sri-ko-lms-platform" or similar
   - Click on the API

3. **Create Application**:
   - Go to "Applications" section
   - Create a new application
   - Give it a meaningful name (e.g., "SRI-KO LMS Frontend")

4. **Subscribe to API**:
   - Subscribe your application to the API
   - Choose the appropriate subscription plan

5. **Generate API Key**:
   - Go to "Subscriptions" tab
   - Find your subscription
   - Generate an API key
   - Copy the API key

6. **Update Configuration**:
   - Replace `YOUR_CHOREO_API_KEY_HERE` with your actual API key
   - Redeploy your frontend

### Comparison with FarmerAssistance Project

The FarmerAssistance project works correctly because:
- ✅ Uses `window.configs` (not `window.config`)
- ✅ Has correct Choreo API URL
- ✅ Script loads from correct path `/config.js`
- ✅ Config object structure matches expected format
- ✅ Includes proper API key configuration
