# SRI-KO LMS - Learning Management System

A comprehensive Learning Management System built with MERN stack for SRI-KO Foreign Language Training Center.

## 🏗️ Project Structure

```
SRI-KO_LMS_MERN/
├── 📁 Backend/                 # Node.js/Express backend
├── 📁 Frontend/                # React frontend application
├── 📁 docs/                    # Documentation files
├── 📁 testing/                 # Testing files and collections
├── 📁 assets/                  # Images and media files
├── 📁 scripts/                 # Utility scripts
├── 📁 .github/                 # GitHub workflows and templates
├── 📄 package.json             # Root package configuration
└── 📄 README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SRI-KO_LMS_MERN
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd Backend && npm install
   cd ../Frontend && npm install
   ```

3. **Environment Setup**
   - Copy `Backend/env.example` to `Backend/config.env`
   - Update MongoDB connection string and other environment variables

4. **Start the application**
   ```bash
   # Start backend server
   cd Backend && npm start
   
   # Start frontend (in new terminal)
   cd Frontend && npm run dev
   ```

## 📁 Directory Structure

### Backend (`/Backend`)
- **API Routes**: Authentication, users, courses, admin, payments
- **Models**: User, Course, Payment, Progress, Subscription
- **Middleware**: Authentication, validation
- **Configuration**: Environment files, database connection

### Frontend (`/Frontend`)
- **Components**: Reusable UI components
- **Pages**: Application pages and routes
- **Services**: API service layer
- **Context**: Authentication and state management
- **Assets**: Static files and images

### Documentation (`/docs`)
- **README files**: Detailed documentation for different features
- **Setup guides**: Installation and configuration instructions
- **Troubleshooting**: Common issues and solutions

### Testing (`/testing`)
- **Postman Collection**: API testing collection
- **Test files**: Automated testing scripts

### Assets (`/assets`)
- **Images**: Logo, screenshots, and media files
- **Documents**: Additional project assets

### Scripts (`/scripts`)
- **Utility scripts**: Deployment and maintenance scripts
- **Test files**: HTML test files and utilities

## 🔧 Features

- **User Management**: Registration, authentication, profile management
- **Course Management**: Create, edit, and manage courses
- **Admin Panel**: Comprehensive admin dashboard
- **Payment Integration**: Subscription and payment handling
- **Analytics**: User engagement and course analytics
- **Responsive Design**: Mobile-friendly interface

## 📚 Documentation

Detailed documentation is available in the `/docs` folder:

- [Main README](docs/README.md) - Complete project overview
- [Admin Guide](docs/ADMIN_DEBUG_GUIDE.md) - Admin panel documentation
- [Deployment Guide](docs/DEPLOYMENT_FIX_README.md) - Deployment instructions
- [API Testing](docs/POSTMAN_TESTING_GUIDE.md) - API testing guide
- [Database Migration](docs/MONGODB_ATLAS_MIGRATION_COMPLETE.md) - Database setup

## 🧪 Testing

- **API Testing**: Use the Postman collection in `/testing`
- **Frontend Testing**: Run `npm test` in the Frontend directory
- **Backend Testing**: Run `npm test` in the Backend directory

## 🚀 Deployment

See [Deployment Guide](docs/DEPLOYMENT_FIX_README.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software for SRI-KO Foreign Language Training Center.

## 📞 Support

For support and questions, please contact the development team.

---

**SRI-KO Foreign Language Training Center**  
Learning Management System
