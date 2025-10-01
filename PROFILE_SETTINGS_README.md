# Profile and Settings Pages - SRI-KO LMS

## Overview

This implementation provides comprehensive Profile and Settings pages for the SRI-KO Learning Management System, featuring professional design, full database connectivity, and extensive user management capabilities.

## Features Implemented

### Profile Page (`/profile`)

- **Personal Information Management**
  - Full name editing
  - Bio/About section
  - Profile picture (avatar) URL
  - Phone number
  - Location
  - Website URL
  - Social media links (LinkedIn, Twitter, GitHub)

- **Visual Design**
  - Professional gradient profile header
  - Role-based badge colors (Student: Green, Instructor: Blue, Admin: Red)
  - Responsive grid layout
  - Interactive edit/save/cancel functionality
  - Social media link buttons with proper icons

- **Account Statistics**
  - Enrolled courses count
  - Member since date
  - Account type display
  - Quick action buttons

### Settings Page (`/settings`)

- **Tabbed Interface**
  - Account Information
  - Security Settings
  - Notification Preferences
  - Privacy Settings

- **Security Features**
  - Password change with current password verification
  - Password visibility toggles
  - Account deletion warning
  - Form validation

- **Notification Management**
  - Email notifications toggle
  - Course updates preferences
  - Assignment reminders
  - System announcements
  - Marketing emails opt-in/out

- **Privacy Controls**
  - Profile visibility settings (Public/Private/Friends)
  - Email visibility control
  - Course enrollment visibility
  - Message permissions

## Backend Implementation

### Database Schema Updates

Extended the User model with:

```javascript
// Notification preferences
notifications: {
  emailNotifications: Boolean,
  courseUpdates: Boolean,
  assignmentReminders: Boolean,
  systemAnnouncements: Boolean,
  marketingEmails: Boolean
}

// Privacy settings
privacy: {
  profileVisibility: String, // 'public', 'private', 'friends'
  showEmail: Boolean,
  showCourses: Boolean,
  allowMessages: Boolean
}

// Additional profile fields
phone: String,
location: String,
website: String,
socialLinks: {
  linkedin: String,
  twitter: String,
  github: String
},
lastLogin: Date
```

### API Endpoints

- `GET /api/users/profile` - Get user profile data
- `PUT /api/users/profile` - Update profile information
- `PUT /api/users/password` - Change password
- `PUT /api/users/notifications` - Update notification preferences
- `PUT /api/users/privacy` - Update privacy settings
- `PUT /api/users/last-login` - Update last login timestamp

### Validation

Comprehensive form validation using express-validator:

- Name: 2-50 characters
- Bio: Max 500 characters
- Phone: Valid mobile phone format
- Location: Max 100 characters
- Website: Valid URL format
- Social links: Valid URL format
- Password: Min 6 characters with current password verification

## Frontend Implementation

### Technologies Used

- React with hooks (useState, useEffect)
- Tailwind CSS for styling
- Heroicons for icons
- React Hot Toast for notifications
- Axios for API calls

### Key Components

- **ProfilePage**: Complete profile management interface
- **SettingsPage**: Comprehensive settings with tabbed navigation
- **Form Validation**: Client-side validation with error handling
- **Responsive Design**: Mobile-first approach with responsive grids

### State Management

- Local state management with React hooks
- Integration with existing AuthContext
- Real-time form updates
- Loading states and error handling

## Database Connectivity

### MongoDB Atlas Integration

- Full MongoDB Atlas connectivity
- Mongoose ODM for schema management
- Automatic validation and error handling
- Optimized queries with proper indexing

### Test Script

A comprehensive test script (`test-database.js`) is included to verify:

- Database connection
- User model functionality
- CRUD operations
- New field validation
- Update operations

## Usage Instructions

### Running the Application

1. **Backend Setup**

   ```bash
   cd Backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**

   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

3. **Database Testing**
   ```bash
   cd Backend
   node test-database.js
   ```

### Environment Variables

Ensure your `.env` file includes:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```

## Professional Features

### Design Excellence

- Modern, clean interface design
- Consistent color scheme and typography
- Smooth animations and transitions
- Professional form layouts
- Responsive design for all devices

### User Experience

- Intuitive navigation
- Clear visual feedback
- Comprehensive error handling
- Loading states for all operations
- Confirmation dialogs for critical actions

### Security

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CSRF protection
- Secure password change process

## Future Enhancements

### Potential Additions

- Profile picture upload functionality
- Email verification system
- Two-factor authentication
- Activity log/history
- Export user data functionality
- Advanced privacy controls
- Notification scheduling
- Theme customization

### Performance Optimizations

- Image optimization for avatars
- Lazy loading for large datasets
- Caching for frequently accessed data
- Database query optimization

## Conclusion

The Profile and Settings pages provide a comprehensive, professional-grade user management system that integrates seamlessly with MongoDB Atlas. The implementation follows modern web development best practices and provides an excellent foundation for a learning management system.

The pages are fully functional, visually appealing, and ready for production use with proper database connectivity and security measures in place.
