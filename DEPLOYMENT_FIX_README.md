# SRI-KO LMS Frontend Deployment Guide

## Issue Resolution: API URL Configuration

### Problem Identified
The frontend was making requests to `http://localhost:5000` instead of the Choreo deployment URL because:

1. **Wrong config.js path**: HTML referenced `/public/config.js` instead of `/config.js`
2. **Property name mismatch**: Config used `window.config` but code expected `window.configs`
3. **Placeholder URL**: The config.js contained a placeholder instead of the actual Choreo URL

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

### Deployment Process

#### Option 1: Use the Deployment Script
```bash
cd Frontend
./deploy-config.sh
```

#### Option 2: Manual Steps
1. Update `public/config.js` with the correct Choreo API URL
2. Run `npm run build`
3. Update `dist/config.js` with the correct Choreo API URL
4. Deploy the `dist` folder to Choreo

### Verification Steps

1. **Check Network Tab**: After deployment, verify that login requests go to the Choreo URL, not localhost
2. **Console Logs**: The API service logs will show the correct base URL
3. **Authentication**: Login should work with the deployed backend

### Configuration Files

#### `public/config.js` (Development)
```javascript
window.configs = {
    apiUrl: 'https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1',
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
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
```

### API Configuration Logic

The `src/config/apiConfig.ts` file uses this logic:
```typescript
const baseUrl = window?.configs?.apiUrl
  ? window.configs.apiUrl
  : "http://localhost:5000"; // fallback

const apiUrl = `${baseUrl}/api`;
```

This ensures:
- ✅ Production: Uses Choreo URL from `window.configs.apiUrl`
- ✅ Development: Falls back to localhost:5000
- ✅ Automatic `/api` prefix addition

### Troubleshooting

If requests still go to localhost:
1. Check browser cache - clear it completely
2. Verify `config.js` is loaded in Network tab
3. Check console for `window.configs` object
4. Ensure the script tag loads before the main app bundle

### Comparison with FarmerAssistance Project

The FarmerAssistance project works correctly because:
- ✅ Uses `window.configs` (not `window.config`)
- ✅ Has correct Choreo API URL
- ✅ Script loads from correct path `/config.js`
- ✅ Config object structure matches expected format
