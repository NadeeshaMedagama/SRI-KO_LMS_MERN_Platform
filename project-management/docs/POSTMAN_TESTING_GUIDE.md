# 🧪 SRI-KO LMS Backend API Testing Guide with Postman

## 📋 **Setup Instructions**

### 1. **Environment Setup**
- **Base URL**: `http://localhost:5000/api`
- **Backend Server**: Make sure it's running on port 5000
- **Database**: MongoDB should be connected

### 2. **Test Users Available**
```
Admin User:
- Email: admin@sriko.com
- Password: admin123
- Role: admin

Student Users:
- Email: instructor@example.com
- Password: admin123
- Role: student

- Email: instructor1@example.com
- Password: admin123
- Role: student
```

---

## 🔐 **Authentication Endpoints**

### 1. **User Registration**
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "student"
}

Expected Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Test User",
    "email": "test@example.com",
    "role": "student"
  }
}
```

### 2. **User Login**
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@sriko.com",
  "password": "admin123"
}

Expected Response:
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@sriko.com",
    "role": "admin"
  }
}
```

### 3. **Admin Login**
```
POST /api/auth/admin-login
Content-Type: application/json

Body:
{
  "email": "admin@sriko.com",
  "password": "admin123"
}

Expected Response:
{
  "success": true,
  "message": "Admin login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@sriko.com",
    "role": "admin"
  }
}
```

### 4. **Get Current User**
```
GET /api/auth/me
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@sriko.com",
    "role": "admin",
    "avatar": "",
    "bio": "",
    "phone": "",
    "location": "",
    "website": "",
    "socialLinks": {},
    "enrolledCourses": [],
    "notifications": {},
    "privacy": {},
    "emailVerified": false,
    "lastLogin": "2025-10-05T03:30:00.000Z",
    "createdAt": "2025-10-05T03:06:30.479Z"
  }
}
```

### 5. **Logout**
```
POST /api/auth/logout
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 **User Management Endpoints**

### 1. **Get User Profile**
```
GET /api/users/profile
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@sriko.com",
    "role": "admin",
    "avatar": "",
    "bio": "",
    "phone": "",
    "location": "",
    "website": "",
    "socialLinks": {},
    "enrolledCourses": [],
    "notifications": {},
    "privacy": {},
    "emailVerified": false,
    "lastLogin": "2025-10-05T03:30:00.000Z",
    "createdAt": "2025-10-05T03:06:30.479Z"
  }
}
```

### 2. **Update User Profile**
```
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "phone": "+1234567890",
  "location": "New York",
  "website": "https://example.com",
  "socialLinks": {
    "twitter": "https://twitter.com/username",
    "linkedin": "https://linkedin.com/in/username"
  }
}

Expected Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "Updated Name",
    "email": "admin@sriko.com",
    "role": "admin",
    "avatar": "",
    "bio": "Updated bio"
  }
}
```

### 3. **Change Password**
```
PUT /api/users/password
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}

Expected Response:
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 4. **Update Notification Preferences**
```
PUT /api/users/notifications
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "notifications": {
    "email": true,
    "push": false,
    "sms": true,
    "courseUpdates": true,
    "announcements": true
  }
}

Expected Response:
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "notifications": {
    "email": true,
    "push": false,
    "sms": true,
    "courseUpdates": true,
    "announcements": true
  }
}
```

### 5. **Update Privacy Settings**
```
PUT /api/users/privacy
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "privacy": {
    "profileVisibility": "public",
    "emailVisibility": "private",
    "courseProgress": "public",
    "showOnlineStatus": true
  }
}

Expected Response:
{
  "success": true,
  "message": "Privacy settings updated successfully",
  "privacy": {
    "profileVisibility": "public",
    "emailVisibility": "private",
    "courseProgress": "public",
    "showOnlineStatus": true
  }
}
```

---

## 📚 **Course Management Endpoints**

### 1. **Get All Courses**
```
GET /api/courses?page=1&limit=10&published=true&category=programming&level=beginner&search=react

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- published: Filter by published status (true/false)
- category: Filter by category (programming, design, business, etc.)
- level: Filter by level (beginner, intermediate, advanced)
- search: Search in title and description

Expected Response:
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "pages": 1,
  "courses": [
    {
      "_id": "course_id",
      "title": "Complete Web Development Bootcamp",
      "description": "Learn full-stack web development...",
      "instructor": {
        "_id": "instructor_id",
        "name": "Admin",
        "avatar": ""
      },
      "category": "programming",
      "level": "beginner",
      "duration": 12,
      "price": 15000,
      "enrolledStudents": [],
      "averageRating": 0,
      "isPublished": true,
      "createdAt": "2025-10-05T03:06:30.479Z"
    }
  ]
}
```

### 2. **Get Course by ID**
```
GET /api/courses/{course_id}

Expected Response:
{
  "success": true,
  "course": {
    "_id": "course_id",
    "title": "Complete Web Development Bootcamp",
    "description": "Learn full-stack web development...",
    "instructor": {
      "_id": "instructor_id",
      "name": "Admin",
      "avatar": "",
      "bio": ""
    },
    "category": "programming",
    "level": "beginner",
    "duration": 12,
    "price": 15000,
    "thumbnail": "",
    "curriculum": [
      {
        "week": 1,
        "title": "HTML Fundamentals",
        "description": "Learn the basics of HTML...",
        "lessons": [
          {
            "title": "Introduction to HTML",
            "content": "Understanding HTML structure...",
            "duration": 45,
            "type": "video",
            "isFreePreview": true,
            "_id": "lesson_id"
          }
        ],
        "_id": "week_id"
      }
    ],
    "enrolledStudents": [],
    "averageRating": 0,
    "isPublished": true,
    "tags": ["web development", "frontend", "javascript", "react"],
    "prerequisites": ["Basic computer skills", "No prior programming experience required"],
    "reviews": [],
    "createdAt": "2025-10-05T03:06:30.479Z"
  }
}
```

### 3. **Create Course (Instructor/Admin Only)**
```
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "New Course Title",
  "description": "Course description here",
  "category": "programming",
  "level": "beginner",
  "duration": 8,
  "price": 10000,
  "thumbnail": "https://example.com/image.jpg",
  "curriculum": [
    {
      "week": 1,
      "title": "Introduction",
      "description": "Course introduction",
      "lessons": [
        {
          "title": "Welcome",
          "content": "Welcome to the course",
          "duration": 30,
          "type": "video",
          "isFreePreview": true
        }
      ]
    }
  ],
  "prerequisites": ["Basic knowledge"],
  "tags": ["tag1", "tag2"]
}

Expected Response:
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "_id": "new_course_id",
    "title": "New Course Title",
    "description": "Course description here",
    "instructor": "instructor_id",
    "category": "programming",
    "level": "beginner",
    "duration": 8,
    "price": 10000,
    "isPublished": false,
    "createdAt": "2025-10-05T04:00:00.000Z"
  }
}
```

### 4. **Update Course (Instructor/Admin Only)**
```
PUT /api/courses/{course_id}
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "Updated Course Title",
  "description": "Updated description",
  "price": 12000,
  "isPublished": true
}

Expected Response:
{
  "success": true,
  "message": "Course updated successfully",
  "course": {
    "_id": "course_id",
    "title": "Updated Course Title",
    "description": "Updated description",
    "price": 12000,
    "isPublished": true,
    "updatedAt": "2025-10-05T04:00:00.000Z"
  }
}
```

### 5. **Delete Course (Instructor/Admin Only)**
```
DELETE /api/courses/{course_id}
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### 6. **Enroll in Course**
```
POST /api/courses/{course_id}/enroll
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "message": "Enrolled in course successfully",
  "course": {
    "id": "course_id",
    "title": "Course Title",
    "progress": 0
  }
}
```

### 7. **Get My Courses**
```
GET /api/courses/my-courses
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "courses": [
    {
      "_id": "course_id",
      "title": "Course Title",
      "instructor": {
        "_id": "instructor_id",
        "name": "Instructor Name",
        "avatar": ""
      },
      "progress": 0
    }
  ]
}
```

### 8. **Add Course Review**
```
POST /api/courses/{course_id}/reviews
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "rating": 5,
  "comment": "Great course! Highly recommended."
}

Expected Response:
{
  "success": true,
  "message": "Review added successfully",
  "course": {
    "_id": "course_id",
    "averageRating": 5,
    "reviews": [
      {
        "user": "user_id",
        "rating": 5,
        "comment": "Great course! Highly recommended.",
        "createdAt": "2025-10-05T04:00:00.000Z"
      }
    ]
  }
}
```

---

## 👨‍💼 **Admin Management Endpoints**

### 1. **Get Admin Dashboard Stats**
```
GET /api/admin/stats
Authorization: Bearer {admin_token}

Expected Response:
{
  "success": true,
  "stats": {
    "totalUsers": 3,
    "totalCourses": 3,
    "totalRevenue": 45000,
    "activeUsers": 3,
    "completedCourses": 3,
    "pendingApprovals": 0
  }
}
```

### 2. **Get All Users (Admin Only)**
```
GET /api/admin/users?page=1&limit=10&search=admin&role=admin&status=active

Query Parameters:
- page: Page number
- limit: Items per page
- search: Search in name and email
- role: Filter by role (student, instructor, admin)
- status: Filter by status (active, inactive)

Expected Response:
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "users": [
    {
      "_id": "user_id",
      "name": "Admin",
      "email": "admin@sriko.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2025-10-05T03:06:30.479Z"
    }
  ]
}
```

### 3. **Create User (Admin Only)**
```
POST /api/admin/users
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "student",
  "bio": "New user bio",
  "phone": "+1234567890",
  "location": "New York",
  "website": "https://example.com",
  "isActive": true
}

Expected Response:
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "new_user_id",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "student",
    "bio": "New user bio",
    "phone": "+1234567890",
    "location": "New York",
    "website": "https://example.com",
    "isActive": true,
    "createdAt": "2025-10-05T04:00:00.000Z"
  }
}
```

### 4. **Update User (Admin Only)**
```
PUT /api/admin/users/{user_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "role": "instructor",
  "isActive": false
}

Expected Response:
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "name": "Updated Name",
    "email": "user@example.com",
    "role": "instructor",
    "isActive": false,
    "updatedAt": "2025-10-05T04:00:00.000Z"
  }
}
```

### 5. **Delete User (Admin Only)**
```
DELETE /api/admin/users/{user_id}
Authorization: Bearer {admin_token}

Expected Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 6. **Toggle User Status (Admin Only)**
```
PUT /api/admin/users/{user_id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "isActive": false
}

Expected Response:
{
  "success": true,
  "message": "User deactivated successfully",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "isActive": false
  }
}
```

### 7. **Get All Courses (Admin Only)**
```
GET /api/admin/courses?page=1&limit=10&search=react&category=programming&status=published

Expected Response:
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "pages": 1,
  "courses": [
    {
      "_id": "course_id",
      "title": "Course Title",
      "description": "Course description",
      "instructor": {
        "_id": "instructor_id",
        "name": "Instructor Name",
        "email": "instructor@example.com"
      },
      "enrolledStudents": [
        {
          "_id": "student_id",
          "name": "Student Name",
          "email": "student@example.com"
        }
      ],
      "category": "programming",
      "level": "beginner",
      "price": 15000,
      "isPublished": true,
      "createdAt": "2025-10-05T03:06:30.479Z"
    }
  ]
}
```

### 8. **Create Course (Admin Only)**
```
POST /api/admin/courses
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "title": "Admin Created Course",
  "description": "Course created by admin",
  "category": "programming",
  "level": "intermediate",
  "duration": 10,
  "price": 20000,
  "instructor": "instructor_id",
  "isPublished": true,
  "curriculum": [
    {
      "week": 1,
      "title": "Introduction",
      "description": "Course introduction",
      "lessons": [
        {
          "title": "Welcome",
          "content": "Welcome to the course",
          "duration": 30,
          "type": "video",
          "isFreePreview": true
        }
      ]
    }
  ]
}

Expected Response:
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "_id": "new_course_id",
    "title": "Admin Created Course",
    "description": "Course created by admin",
    "instructor": "instructor_id",
    "category": "programming",
    "level": "intermediate",
    "duration": 10,
    "price": 20000,
    "isPublished": true,
    "createdAt": "2025-10-05T04:00:00.000Z"
  }
}
```

### 9. **Toggle Course Status (Admin Only)**
```
PUT /api/admin/courses/{course_id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "isPublished": false
}

Expected Response:
{
  "success": true,
  "message": "Course unpublished successfully",
  "course": {
    "id": "course_id",
    "title": "Course Title",
    "isPublished": false
  }
}
```

### 10. **Get Analytics (Admin Only)**
```
GET /api/admin/analytics

Expected Response:
{
  "success": true,
  "analytics": {
    "overview": {
      "totalUsers": 3,
      "totalCourses": 3,
      "totalRevenue": 45000,
      "activeUsers": 3,
      "completedCourses": 3,
      "averageRating": 4.5
    },
    "topCourses": [
      {
        "_id": "course_id",
        "title": "Course Title",
        "instructor": {
          "_id": "instructor_id",
          "name": "Instructor Name"
        },
        "enrolledStudents": []
      }
    ],
    "monthlyStats": [
      {
        "month": "January",
        "year": 2024,
        "users": 150,
        "revenue": 5000
      }
    ],
    "recentActivities": [
      {
        "message": "New user registered",
        "createdAt": "2025-10-05T04:00:00.000Z"
      }
    ]
  }
}
```

---

## 💳 **Subscription Management Endpoints**

### 1. **Get Subscription Plans**
```
GET /api/subscriptions/plans

Expected Response:
{
  "success": true,
  "plans": [
    {
      "name": "starter",
      "displayName": "Starter",
      "description": "Perfect for individual learners and small institutions",
      "features": {
        "maxCourses": 5,
        "maxStudents": 100,
        "storage": "1GB",
        "support": "Email"
      },
      "pricing": {
        "monthly": 0,
        "yearly": 0
      }
    },
    {
      "name": "pro",
      "displayName": "Pro",
      "description": "Ideal for growing institutions and training centers",
      "features": {
        "maxCourses": 50,
        "maxStudents": 1000,
        "storage": "10GB",
        "support": "Priority Email"
      },
      "pricing": {
        "monthly": 29.99,
        "yearly": 299.99
      }
    },
    {
      "name": "premium",
      "displayName": "Premium",
      "description": "Complete solution for large institutions and enterprises",
      "features": {
        "maxCourses": -1,
        "maxStudents": -1,
        "storage": "100GB",
        "support": "24/7 Phone"
      },
      "pricing": {
        "monthly": 99.99,
        "yearly": 999.99
      }
    }
  ]
}
```

### 2. **Get Current Subscription**
```
GET /api/subscriptions/current
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "subscription": {
    "_id": "subscription_id",
    "user": "user_id",
    "plan": "starter",
    "billingCycle": "yearly",
    "status": "active",
    "startDate": "2025-10-05T04:00:00.000Z",
    "endDate": "2026-10-05T04:00:00.000Z",
    "amount": 0,
    "features": {
      "maxCourses": 5,
      "maxStudents": 100,
      "storage": "1GB",
      "support": "Email"
    },
    "autoRenew": false,
    "createdAt": "2025-10-05T04:00:00.000Z"
  }
}
```

### 3. **Create Subscription**
```
POST /api/subscriptions/create
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "plan": "pro",
  "billingCycle": "monthly"
}

Expected Response:
{
  "success": true,
  "subscription": {
    "_id": "subscription_id",
    "user": "user_id",
    "plan": "pro",
    "billingCycle": "monthly",
    "status": "trial",
    "startDate": "2025-10-05T04:00:00.000Z",
    "endDate": "2025-10-19T04:00:00.000Z",
    "trialEndDate": "2025-10-19T04:00:00.000Z",
    "amount": 29.99,
    "features": {
      "maxCourses": 50,
      "maxStudents": 1000,
      "storage": "10GB",
      "support": "Priority Email"
    },
    "autoRenew": true,
    "createdAt": "2025-10-05T04:00:00.000Z"
  },
  "message": "Trial started successfully"
}
```

### 4. **Upgrade Subscription**
```
PUT /api/subscriptions/upgrade
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "plan": "premium",
  "billingCycle": "yearly"
}

Expected Response:
{
  "success": true,
  "subscription": {
    "_id": "subscription_id",
    "user": "user_id",
    "plan": "premium",
    "billingCycle": "yearly",
    "status": "active",
    "amount": 999.99,
    "features": {
      "maxCourses": -1,
      "maxStudents": -1,
      "storage": "100GB",
      "support": "24/7 Phone"
    }
  },
  "payment": {
    "_id": "payment_id",
    "amount": 999.99,
    "status": "pending",
    "dueDate": "2025-10-05T04:00:00.000Z"
  },
  "message": "Subscription upgraded successfully"
}
```

### 5. **Cancel Subscription**
```
PUT /api/subscriptions/cancel
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "reason": "No longer needed"
}

Expected Response:
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

### 6. **Get Subscription Usage**
```
GET /api/subscriptions/usage
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "usage": {
    "courses": {
      "used": 2,
      "limit": 50,
      "unlimited": false
    },
    "students": {
      "used": 15,
      "limit": 1000,
      "unlimited": false
    },
    "apiCalls": {
      "used": 150,
      "limit": 1000,
      "unlimited": false
    }
  },
  "subscription": {
    "plan": "pro",
    "status": "active",
    "endDate": "2025-11-05T04:00:00.000Z"
  }
}
```

### 7. **Get Payment History**
```
GET /api/subscriptions/payments?page=1&limit=10
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "payments": [
    {
      "_id": "payment_id",
      "amount": 29.99,
      "status": "completed",
      "paymentMethod": "credit_card",
      "paymentDate": "2025-10-05T04:00:00.000Z",
      "subscription": {
        "_id": "subscription_id",
        "plan": "pro",
        "billingCycle": "monthly"
      }
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 1,
    "total": 1
  }
}
```

---

## 💰 **Payment Management Endpoints**

### 1. **Create Payment**
```
POST /api/payments/create
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "subscriptionId": "subscription_id",
  "paymentMethod": "credit_card",
  "amount": 29.99,
  "gatewayResponse": {
    "transactionId": "txn_123456",
    "status": "success"
  }
}

Expected Response:
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "user": "user_id",
    "subscription": "subscription_id",
    "amount": 29.99,
    "paymentMethod": "credit_card",
    "status": "pending",
    "dueDate": "2025-10-05T04:00:00.000Z",
    "createdAt": "2025-10-05T04:00:00.000Z"
  },
  "message": "Payment created successfully"
}
```

### 2. **Complete Payment**
```
PUT /api/payments/{payment_id}/complete
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "gatewayTransactionId": "txn_123456",
  "gatewayResponse": {
    "transactionId": "txn_123456",
    "status": "success",
    "amount": 29.99
  }
}

Expected Response:
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "status": "completed",
    "paymentDate": "2025-10-05T04:00:00.000Z",
    "gatewayTransactionId": "txn_123456"
  },
  "message": "Payment completed successfully"
}
```

### 3. **Mark Payment as Failed**
```
PUT /api/payments/{payment_id}/fail
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "reason": "Insufficient funds"
}

Expected Response:
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "status": "failed",
    "failureReason": "Insufficient funds"
  },
  "message": "Payment marked as failed"
}
```

### 4. **Process Refund**
```
POST /api/payments/{payment_id}/refund
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "amount": 29.99,
  "reason": "Customer request"
}

Expected Response:
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "status": "refunded",
    "refundAmount": 29.99,
    "refundReason": "Customer request",
    "refundDate": "2025-10-05T04:00:00.000Z"
  },
  "message": "Refund processed successfully"
}
```

### 5. **Get Payment Details**
```
GET /api/payments/{payment_id}
Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "subscription": {
      "_id": "subscription_id",
      "plan": "pro",
      "billingCycle": "monthly"
    },
    "amount": 29.99,
    "status": "completed",
    "paymentMethod": "credit_card",
    "paymentDate": "2025-10-05T04:00:00.000Z",
    "gatewayTransactionId": "txn_123456"
  }
}
```

### 6. **Get Payment Stats (Admin Only)**
```
GET /api/payments/stats?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {admin_token}

Expected Response:
{
  "success": true,
  "stats": {
    "totalRevenue": 15000,
    "totalPayments": 50,
    "successfulPayments": 45,
    "failedPayments": 5,
    "averagePayment": 300
  },
  "revenueByPlan": {
    "starter": 0,
    "pro": 10000,
    "premium": 5000
  },
  "monthlyRevenue": [
    {
      "month": "January",
      "revenue": 2000
    },
    {
      "month": "February",
      "revenue": 2500
    }
  ]
}
```

### 7. **Get Recent Payments (Admin Only)**
```
GET /api/payments/recent?limit=10
Authorization: Bearer {admin_token}

Expected Response:
{
  "success": true,
  "payments": [
    {
      "_id": "payment_id",
      "user": {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "subscription": {
        "_id": "subscription_id",
        "plan": "pro",
        "billingCycle": "monthly"
      },
      "amount": 29.99,
      "status": "completed",
      "paymentDate": "2025-10-05T04:00:00.000Z"
    }
  ]
}
```

### 8. **Get All Payments (Admin Only)**
```
GET /api/payments/all?page=1&limit=20&status=completed&plan=pro&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {admin_token}

Expected Response:
{
  "success": true,
  "payments": [
    {
      "_id": "payment_id",
      "user": {
        "_id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "subscription": {
        "_id": "subscription_id",
        "plan": "pro",
        "billingCycle": "monthly"
      },
      "amount": 29.99,
      "status": "completed",
      "paymentDate": "2025-10-05T04:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

---

## 🔍 **System Health & Utility Endpoints**

### 1. **Health Check**
```
GET /api/health

Expected Response:
{
  "success": true,
  "message": "SRI-KO LMS server is running",
  "timestamp": "2025-10-05T04:00:00.000Z",
  "environment": "development",
  "mongodb": "Connected",
  "features": {
    "subscriptions": "Available",
    "payments": "Available",
    "courseManagement": "Available",
    "userManagement": "Available"
  }
}
```

### 2. **General Health Check**
```
GET /health

Expected Response:
{
  "status": "OK",
  "message": "SRI-KO LMS API is running",
  "timestamp": "2025-10-05T04:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 📝 **Testing Tips & Best Practices**

### 1. **Authentication Flow**
1. Start with user registration or login
2. Copy the JWT token from the response
3. Use the token in the `Authorization` header for protected endpoints
4. Format: `Authorization: Bearer {your_jwt_token}`

### 2. **Error Handling**
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

### 3. **Testing Sequence**
1. **Health Check** → Verify server is running
2. **Authentication** → Login/Register to get token
3. **User Management** → Test profile operations
4. **Course Management** → Test course CRUD operations
5. **Admin Functions** → Test admin-only endpoints
6. **Subscriptions** → Test subscription management
7. **Payments** → Test payment processing

### 4. **Common Test Scenarios**
- **Valid Requests**: Test with correct data
- **Invalid Requests**: Test with missing/invalid data
- **Unauthorized Access**: Test without token
- **Permission Testing**: Test with different user roles
- **Edge Cases**: Test with boundary values

### 5. **Postman Collection Setup**
1. Create a new collection: "SRI-KO LMS API"
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: `{{jwt_token}}`
3. Use variables in requests: `{{base_url}}/auth/login`
4. Set up pre-request scripts to automatically set tokens

### 6. **Environment Variables**
```
base_url: http://localhost:5000/api
admin_email: admin@sriko.com
admin_password: admin123
student_email: instructor@example.com
student_password: admin123
```

---

## 🚨 **Troubleshooting**

### Common Issues:
1. **401 Unauthorized**: Check if token is valid and properly formatted
2. **403 Forbidden**: Verify user has required permissions
3. **404 Not Found**: Check if resource ID exists
4. **500 Server Error**: Check server logs for detailed error messages
5. **CORS Issues**: Ensure frontend URL is in CORS configuration

### Debug Steps:
1. Check server logs in terminal
2. Verify database connection
3. Test with curl commands first
4. Check request headers and body format
5. Validate JWT token expiration

---

## 📊 **Expected Response Formats**

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... } // Optional, contains the actual data
}
```

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional, contains validation errors
}
```

---

This comprehensive guide covers all the major endpoints in your SRI-KO LMS backend. Start with the health check, then authentication, and work your way through the different modules. Make sure your backend server is running on `http://localhost:5000` before testing!
