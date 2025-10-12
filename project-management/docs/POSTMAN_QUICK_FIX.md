# 🔧 SRI-KO LMS Postman Testing - Quick Fix Guide

## 🚨 **Issue Identified:**
You're getting "Course not found" errors because the Postman collection is using incorrect course IDs.

## ✅ **Solution: Use Correct Course IDs**

### **Available Courses in Your Database:**

```
Course ID: 68e1e0b696d522c7982a5662
Title: Complete Web Development Bootcamp
Published: true

Course ID: 68e1e0b696d522c7982a5668
Title: Advanced React Development
Published: true

Course ID: 68e1e0b696d522c7982a566b
Title: UI/UX Design Fundamentals
Published: true

Course ID: 68e1e0b696d522c7982a566e
Title: Digital Marketing Mastery
Published: true

Course ID: 68e1e0b696d522c7982a5671
Title: Python for Data Science
Published: true

Course ID: 68e1e0b696d522c7982a5674
Title: Business Strategy & Leadership
Published: true
```

## 🔐 **Authentication Issue Fix:**

The login is failing because the password might be different. Let's create a test user or reset the password.

### **Option 1: Create a Test User**
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### **Option 2: Test with Admin Login**
Try the admin login endpoint:
```bash
curl -X POST "http://localhost:5000/api/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sriko.com",
    "password": "admin123"
  }'
```

## 🧪 **Quick Test Commands:**

### **1. Test Course Retrieval:**
```bash
# Get all courses
curl "http://localhost:5000/api/courses?published=true"

# Get specific course
curl "http://localhost:5000/api/courses/68e1e0b696d522c7982a5662"
```

### **2. Test Course Enrollment (after getting token):**
```bash
# First login to get token
TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.token')

# Then enroll in course
curl -X POST "http://localhost:5000/api/courses/68e1e0b696d522c7982a5662/enroll" \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 **Updated Postman Collection Variables:**

Set these variables in your Postman environment:

```
base_url: http://localhost:5000/api
course_id_1: 68e1e0b696d522c7982a5662
course_id_2: 68e1e0b696d522c7982a5668
course_id_3: 68e1e0b696d522c7982a566b
course_id_4: 68e1e0b696d522c7982a566e
course_id_5: 68e1e0b696d522c7982a5671
course_id_6: 68e1e0b696d522c7982a5674
```

## 🔄 **Step-by-Step Testing Process:**

### **Step 1: Health Check**
```bash
curl "http://localhost:5000/api/health"
```

### **Step 2: Register Test User**
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### **Step 3: Login and Get Token**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **Step 4: Test Course Operations**
```bash
# Get courses
curl "http://localhost:5000/api/courses?published=true"

# Get specific course
curl "http://localhost:5000/api/courses/68e1e0b696d522c7982a5662"

# Enroll in course (replace TOKEN with actual token)
curl -X POST "http://localhost:5000/api/courses/68e1e0b696d522c7982a5662/enroll" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 **Working Course Endpoints:**

### **Get Course by ID:**
```
GET http://localhost:5000/api/courses/68e1e0b696d522c7982a5662
```

### **Enroll in Course:**
```
POST http://localhost:5000/api/courses/68e1e0b696d522c7982a5662/enroll
Authorization: Bearer {your_token}
```

### **Get All Courses:**
```
GET http://localhost:5000/api/courses?published=true&page=1&limit=10
```

## 🔍 **Debugging Tips:**

1. **Check if course exists:**
   ```bash
   curl "http://localhost:5000/api/courses/68e1e0b696d522c7982a5662"
   ```

2. **Check authentication:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/api/auth/me"
   ```

3. **Check server logs** in the terminal where you started the backend server

## 📋 **Common Issues & Solutions:**

### **Issue: "Course not found"**
- **Cause:** Using incorrect course ID
- **Solution:** Use one of the valid course IDs listed above

### **Issue: "Invalid email or password"**
- **Cause:** Wrong credentials or user doesn't exist
- **Solution:** Register a new user or check existing users

### **Issue: "Unauthorized"**
- **Cause:** Missing or invalid token
- **Solution:** Login first to get a valid token

### **Issue: "Forbidden"**
- **Cause:** User doesn't have required permissions
- **Solution:** Use admin credentials or check user role

## 🚀 **Quick Start Testing:**

1. **Start Backend:** `cd Backend && npm start`
2. **Register User:** Use the registration command above
3. **Login:** Use the login command above
4. **Copy Token:** Save the token from login response
5. **Test Course:** Use the course ID and token in requests

## 📊 **Expected Responses:**

### **Successful Course Retrieval:**
```json
{
  "success": true,
  "course": {
    "_id": "68e1e0b696d522c7982a5662",
    "title": "Complete Web Development Bootcamp",
    "description": "Learn full-stack web development...",
    "isPublished": true
  }
}
```

### **Successful Enrollment:**
```json
{
  "success": true,
  "message": "Enrolled in course successfully",
  "course": {
    "id": "68e1e0b696d522c7982a5662",
    "title": "Complete Web Development Bootcamp",
    "progress": 0
  }
}
```

---

**Use the correct course IDs above and you should be able to test all functionality successfully!** 🎉
