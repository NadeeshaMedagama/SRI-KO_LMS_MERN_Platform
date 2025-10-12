# 🔧 Admin Dashboard Debug Guide

## ✅ **Backend Status: WORKING PERFECTLY**

The backend is working correctly and returning data:

### **Admin Login Test:**
```bash
curl -X POST "http://localhost:5000/api/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@example.com",
    "password": "Password123"
  }'
```
**Result:** ✅ Success - Returns valid token

### **Admin Stats Test:**
```bash
curl -X GET "http://localhost:5000/api/admin/stats" \
  -H "Authorization: Bearer [TOKEN]"
```
**Result:** ✅ Success - Returns real data:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 6,
    "totalCourses": 8,
    "totalRevenue": 42000,
    "activeUsers": 5,
    "completedCourses": 7,
    "pendingApprovals": 0
  }
}
```

## 🔍 **Frontend Debugging Steps:**

### **Step 1: Check Browser Console**
1. Open `http://localhost:5173/admin/dashboard`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for error messages or logs

### **Step 2: Check Network Tab**
1. In Developer Tools, go to **Network** tab
2. Refresh the admin dashboard page
3. Look for API calls to `/api/admin/stats`, `/api/admin/users`, `/api/admin/courses`
4. Check if requests are being made and what responses are received

### **Step 3: Check Authentication**
1. In Developer Tools, go to **Application** tab
2. Click on **Local Storage** → `http://localhost:5173`
3. Look for `token` key
4. Verify the token exists and is not expired

### **Step 4: Manual Token Test**
If you see a token in localStorage, test it manually:
```bash
# Replace [YOUR_TOKEN] with the actual token from localStorage
curl -X GET "http://localhost:5000/api/admin/stats" \
  -H "Authorization: Bearer [YOUR_TOKEN]"
```

## 🚨 **Common Issues & Solutions:**

### **Issue 1: No Token in localStorage**
**Symptoms:** Console shows "Authentication required"
**Solution:** 
1. Login as admin first: `http://localhost:5173/admin/login`
2. Use credentials: `testadmin@example.com` / `Password123`

### **Issue 2: Token Expired**
**Symptoms:** API calls return 401 Unauthorized
**Solution:** 
1. Logout and login again
2. Or refresh the page to get new token

### **Issue 3: CORS Issues**
**Symptoms:** Network tab shows CORS errors
**Solution:** 
1. Ensure backend is running on `http://localhost:5000`
2. Check `config.js` is pointing to correct URL

### **Issue 4: API Calls Not Being Made**
**Symptoms:** No network requests in Network tab
**Solution:** 
1. Check browser console for JavaScript errors
2. Verify the admin page is loading correctly

## 🎯 **Quick Fix Commands:**

### **Test Admin Login:**
```bash
curl -X POST "http://localhost:5000/api/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@example.com",
    "password": "Password123"
  }'
```

### **Test Admin Stats:**
```bash
curl -X GET "http://localhost:5000/api/admin/stats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTIwMmQ0NDRlOWQ3NmExNjA3MmQ0YiIsImlhdCI6MTc1OTY0MzU4MCwiZXhwIjoxNzYwMjQ4MzgwfQ.Jc9BMqhNxjk59Ymsj2e-Q9ah2m4TtSqLHsFsYOQ20Vo"
```

### **Test Admin Users:**
```bash
curl -X GET "http://localhost:5000/api/admin/users?limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTIwMmQ0NDRlOWQ3NmExNjA3MmQ0YiIsImlhdCI6MTc1OTY0MzU4MCwiZXhwIjoxNzYwMjQ4MzgwfQ.Jc9BMqhNxjk59Ymsj2e-Q9ah2m4TtSqLHsFsYOQ20Vo"
```

## 📋 **Expected Console Logs:**

When the admin dashboard loads correctly, you should see:
```
Stats loaded: {totalUsers: 6, totalCourses: 8, totalRevenue: 42000, ...}
Users loaded: [{name: "Test Admin", email: "testadmin@example.com", ...}, ...]
Courses loaded: [{title: "Complete Web Development Bootcamp", ...}, ...]
```

## 🔧 **If Still Not Working:**

1. **Clear Browser Cache:** Ctrl+Shift+Delete
2. **Hard Refresh:** Ctrl+Shift+R
3. **Check Backend Logs:** Look at terminal running `node server.js`
4. **Verify Frontend Build:** Ensure Vite is running and hot-reloading

## 📞 **Next Steps:**

1. Follow the debugging steps above
2. Check browser console for specific error messages
3. Verify authentication token exists
4. Test API endpoints manually with curl
5. Report specific error messages found

The backend is working perfectly - the issue is likely in the frontend authentication or API call handling.
