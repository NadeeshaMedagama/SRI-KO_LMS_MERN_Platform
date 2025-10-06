# SRI-KO Learning Management System (LMS)

A comprehensive MERN stack learning management system built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SRI-KO_LMS_MERN
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp env.example config.env
   # Edit config.env with your MongoDB URI and other settings
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173 (or 5174 if 5173 is busy)
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/health

## 📁 Project Structure

```
SRI-KO_LMS_MERN/
├── Backend/                 # Node.js/Express backend
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── uploads/             # File uploads
│   └── utils/               # Utility functions
├── Frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/         # API services
│   │   ├── context/         # React context
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── docs/                    # Documentation
├── testing/                 # Test files and tools
│   ├── debug-tools/         # Debug HTML files
│   ├── html-tests/          # Test HTML files
│   └── solutions/           # Solution HTML files
├── scripts/                 # Root package files
└── assets/                  # Project assets
```

## 🛠️ Features

### User Features
- User registration and authentication
- Course browsing and enrollment
- Learning progress tracking
- Profile management
- Payment integration
- Subscription management

### Admin Features
- User management
- Course creation and management
- Analytics dashboard
- Payment monitoring
- System health monitoring

### Instructor Features
- Course creation and editing
- Student progress monitoring
- Content management

## 🔧 Development

### Backend Development
```bash
cd Backend
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests
```

### Frontend Development
```bash
cd Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🧪 Testing

The project includes comprehensive testing tools:

- **Debug Tools**: Located in `testing/debug-tools/`
- **HTML Tests**: Located in `testing/html-tests/`
- **Solutions**: Located in `testing/solutions/`
- **Postman Collection**: `testing/SRI-KO_LMS_Postman_Collection.json`

### Running Tests
1. Open `testing/debug-tools/frontend-backend-test.html` in your browser
2. Use the Postman collection for API testing
3. Check individual HTML test files for specific functionality

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- `README.md` - Main project documentation
- `ADMIN_DEBUG_GUIDE.md` - Admin panel debugging
- `POSTMAN_TESTING_GUIDE.md` - API testing guide
- `WORKING_SOLUTION.md` - Current working solutions

## 🌐 Deployment

### Backend Deployment
1. Set up production environment variables
2. Build the application: `npm run build`
3. Deploy to your preferred hosting service

### Frontend Deployment
1. Update API URLs in `public/config.js`
2. Build the application: `npm run build`
3. Deploy the `dist/` folder to your hosting service

## 🔐 Environment Variables

### Backend (`Backend/config.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_session_secret
```

### Frontend (`Frontend/public/config.js`)
```javascript
window.configs = {
    apiUrl: 'http://localhost:5000', // Local development
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation in the `docs/` folder
2. Use the debug tools in `testing/debug-tools/`
3. Review the test files in `testing/html-tests/`

## 🔄 Recent Updates

- ✅ Fixed frontend blank page issue
- ✅ Organized project structure
- ✅ Added comprehensive testing tools
- ✅ Improved documentation
- ✅ Fixed build errors

---

**SRI-KO LMS** - Empowering education through technology