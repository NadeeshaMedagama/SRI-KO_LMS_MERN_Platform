# 🚀 Choreo Backend Deployment Guide

## Current Issue
The backend routing fixes we implemented are only in your local code and haven't been deployed to Choreo yet. This is why you're still getting 404 errors for database endpoints.

## ✅ What We Fixed (Locally)
1. **Choreo routing middleware** - Handles URL rewriting
2. **Static file serving** - Fixes avatar image 404s  
3. **Health check endpoints** - Both regular and Choreo-specific
4. **MongoDB Atlas connection** - Already configured correctly

## 🎯 Deployment Steps

### Step 1: Access Choreo Dashboard
1. Go to [Choreo Console](https://console.choreo.dev/)
2. Login with your credentials
3. Navigate to your SRI-KO LMS project

### Step 2: Deploy Backend Service
1. **Find your backend service** in the Choreo dashboard
2. **Click on "Deploy"** or "Update" button
3. **Select the source**: Choose "GitHub" and select your repository
4. **Branch**: Select `main` branch (where we pushed our changes)
5. **Path**: Set to `Backend/` directory

### Step 3: Configure Environment Variables
Make sure these environment variables are set in Choreo:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://nadeeshamedagama:Nadeesha2001@cluster0.aairnvz.mongodb.net/SriKo?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-jwt-secret-key-for-production
JWT_EXPIRE=30d
CORS_ORIGIN=https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev
FRONTEND_URL=https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev
SESSION_SECRET=your-super-secure-session-secret-for-production
```

### Step 4: Deploy
1. **Click "Deploy"** to start the deployment
2. **Wait for deployment** to complete (usually 5-10 minutes)
3. **Check deployment logs** for any errors

### Step 5: Verify Deployment
After deployment, test these endpoints:

#### Health Check
```bash
curl https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev/choreo-apis/sri-ko-lms-platform/backend/v1/api/health
```

#### Expected Response:
```json
{
  "success": true,
  "message": "SRI-KO LMS server is running (Choreo)",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "mongodb": "Connected",
  "choreo": "Enabled"
}
```

## 🔧 Alternative: Manual Deployment

If you can't access Choreo dashboard, you can also:

### Option 1: Use Choreo CLI (if available)
```bash
# Install Choreo CLI
npm install -g @wso2/choreo-cli

# Login to Choreo
choreo login

# Deploy backend
cd Backend
choreo deploy
```

### Option 2: GitHub Actions (if configured)
If you have GitHub Actions set up for Choreo deployment, the changes should deploy automatically when pushed to main branch.

## 🧪 Testing After Deployment

Use our testing tool to verify the deployment:
1. Open `testing/debug-tools/choreo-routing-fix-test.html`
2. Run the comprehensive test
3. All endpoints should return 200 OK instead of 404

## 🚨 Troubleshooting

### If deployment fails:
1. **Check logs** in Choreo dashboard
2. **Verify environment variables** are set correctly
3. **Check MongoDB Atlas** connection string
4. **Ensure all dependencies** are in package.json

### If endpoints still return 404:
1. **Wait 5-10 minutes** for deployment to fully propagate
2. **Clear browser cache** completely
3. **Check Choreo service status** in dashboard
4. **Verify the service URL** is correct

### If MongoDB connection fails:
1. **Check Atlas IP whitelist** - add Choreo IP ranges
2. **Verify connection string** format
3. **Check Atlas cluster status**
4. **Ensure database user** has proper permissions

## 📋 Pre-Deployment Checklist

- [ ] Code changes pushed to GitHub main branch
- [ ] MongoDB Atlas connection string verified
- [ ] Environment variables configured in Choreo
- [ ] Choreo service is accessible
- [ ] Frontend config.js has correct API URL

## 🎉 Expected Results After Deployment

✅ **User Dashboard**: `/api/users/dashboard` - 200 OK  
✅ **Join Us Form**: `/api/join-us/submit` - 200 OK  
✅ **Avatar Images**: `/uploads/avatar-*.jpeg` - 200 OK  
✅ **All Database Operations**: Working correctly  
✅ **Health Checks**: Both regular and Choreo-specific working  

## 📞 Support

If you encounter issues:
1. Check Choreo deployment logs
2. Verify MongoDB Atlas connection
3. Test with our debugging tools
4. Check browser network tab for exact error messages

