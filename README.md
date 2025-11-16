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
│   │   └── adminRoutes.js   # Enhanced with analytics endpoints
│   ├── uploads/             # File uploads
│   └── utils/               # Utility functions
├── Frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   └── charts/      # 📊 Chart visualization components
│   │   │       ├── UserGrowthChart.jsx
│   │   │       ├── RevenueChart.jsx
│   │   │       ├── UserCourseComparisonChart.jsx
│   │   │       ├── index.js
│   │   │       └── README.md
│   │   ├── pages/           # Page components
│   │   │   └── AdminAnalyticsPage.jsx  # Enhanced with charts
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── docs/                    # Documentation
├── testing/                 # Test files and tools
│   ├── debug-tools/         # Debug HTML files
│   ├── html-tests/          # Test HTML files
│   └── solutions/           # Solution HTML files
├── scripts/                 # Root package files
├── assets/                  # Project assets
└── Chart Documentation/     # 📊 Analytics implementation docs
    ├── CHARTS_COMPLETE_GUIDE.md
    ├── AUTOMATIC_YEAR_TRANSITION_GUIDE.md
    ├── YEAR_TRANSITION_SUMMARY.md
    ├── ALL_TIME_FILTER_FIX.md
    └── CHART_IMPLEMENTATION_SUMMARY.md
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
- **📊 Advanced Analytics Dashboard with Interactive Charts**
  - **User Growth Visualization**: Line chart with toggle between users and courses metrics
  - **Revenue Trends Analysis**: Currency-formatted line chart showing monthly revenue
  - **User & Course Comparison**: Side-by-side bar chart comparing growth metrics
  - **Automatic Year Transition**: Charts seamlessly work across year boundaries
  - **Flexible Date Ranges**: View last 7, 30, 90, or 365 days
  - **Historical Analysis**: Year selector (2024, 2025, 2026, All Time)
  - **Real-time Data**: Charts update automatically when filters change
  - **Professional Design**: Built with Chart.js for smooth animations and interactions
- Payment monitoring
- System health monitoring

### Instructor Features
- Course creation and editing
- Student progress monitoring
- Content management

## 💻 Technologies Used

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js 4.5.1** - Chart visualization library
- **react-chartjs-2 5.3.1** - React wrapper for Chart.js
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Heroicons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### DevOps & Testing
- **GitHub Actions** - CI/CD pipeline
- **Postman** - API testing
- **Custom Debug Tools** - Testing utilities

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

## 📊 Analytics Dashboard

The Admin Analytics Dashboard provides comprehensive insights into your LMS performance with interactive visualizations.

### Features

#### 📈 User Growth Chart
- **Interactive Toggle**: Switch between user registrations and course enrollments
- **Smooth Animations**: Professional line chart with gradient fill
- **Real-time Updates**: Automatically refreshes when filters change
- **Responsive Design**: Works perfectly on all screen sizes

#### 💰 Revenue Trends Chart
- **Currency Formatting**: Displays amounts in LKR (Sri Lankan Rupees)
- **Monthly Breakdown**: Track revenue month-by-month
- **Visual Insights**: Identify revenue trends and patterns
- **Interactive Tooltips**: Hover for detailed information

#### 📊 User & Course Comparison Chart
- **Side-by-Side Analysis**: Compare users and courses in one view
- **Bar Chart Visualization**: Clear visual distinction with color coding
- **Relationship Insights**: Understand how user growth relates to course creation
- **Historical Data**: View trends across multiple months/years

### Filter Options

#### Year Selector
- **Specific Years**: View data for 2024, 2025, 2026, etc.
- **All Time**: See complete historical data from first record to present
- **Automatic Detection**: Current year selected by default

#### Date Range Selector
- **Last 7 days**: Weekly trends and recent activity
- **Last 30 days**: Monthly overview (default)
- **Last 90 days**: Quarterly analysis
- **Last 365 days**: Annual performance

### Automatic Year Transitions

The analytics system is built to work seamlessly across year boundaries:

✅ **Rolling Windows**: Always calculate from current date  
✅ **Year Boundary Handling**: Automatically includes data from previous years  
✅ **Smart Labels**: Chart labels show year information (e.g., "Jan 26", "Dec 25")  
✅ **No Manual Updates**: Works automatically forever without maintenance  
✅ **All Time View**: Shows complete history from earliest record to today  

### How to Access

1. Log in as an **Admin**
2. Navigate to **Admin Panel**
3. Click on **Analytics & Reports**
4. Explore the interactive charts and filters

### Technical Implementation

- **Frontend**: React components with Chart.js integration
- **Backend**: MongoDB aggregation pipelines for efficient data queries
- **Libraries**: Chart.js v4.5.1, react-chartjs-2 v5.3.1
- **Performance**: Optimized queries with indexed database fields
- **Fallback**: Shows sample data when no real data exists

## 📚 Documentation

Detailed documentation is available in the `docs/` folder and project root:

### General Documentation
- `README.md` - Main project documentation
- `ADMIN_DEBUG_GUIDE.md` - Admin panel debugging
- `POSTMAN_TESTING_GUIDE.md` - API testing guide
- `WORKING_SOLUTION.md` - Current working solutions

### Chart Visualization Documentation
- **`CHARTS_COMPLETE_GUIDE.md`** - Complete guide to chart implementation
- **`AUTOMATIC_YEAR_TRANSITION_GUIDE.md`** - Detailed year transition documentation
- **`YEAR_TRANSITION_SUMMARY.md`** - Quick reference for year transitions
- **`ALL_TIME_FILTER_FIX.md`** - "All Time" filter implementation details
- **`CHART_IMPLEMENTATION_SUMMARY.md`** - Technical implementation summary
- **`Frontend/src/components/charts/README.md`** - Chart component API documentation

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

### November 2024 - Analytics Dashboard Enhancement
- ✅ **Implemented Interactive Chart Visualizations**
  - Added 3 professional charts using Chart.js and react-chartjs-2
  - User Growth Chart: Toggle between users/courses with smooth animations
  - Revenue Trends Chart: LKR currency formatting with gradient fills
  - User & Course Comparison Chart: Side-by-side bar comparison
- ✅ **Automatic Year Transition Support**
  - Rolling date ranges that work seamlessly across year boundaries
  - Smart date labels showing year information (e.g., "Jan 26", "Dec 25")
  - Backend automatically calculates from earliest record to present
- ✅ **Enhanced Filtering Options**
  - Year selector: 2024, 2025, 2026, All Time
  - Date range selector: 7, 30, 90, 365 days
  - "All Time" view shows complete historical data
  - Auto-refresh on filter changes
- ✅ **Improved User Experience**
  - Added cursor pointer to interactive elements
  - Responsive design works on all screen sizes
  - Professional tooltips with formatted data
  - Fallback sample data when no real data exists

### Previous Updates
- ✅ Fixed frontend blank page issue
- ✅ Organized project structure
- ✅ Added comprehensive testing tools
- ✅ Improved documentation
- ✅ Fixed build errors

---

**SRI-KO LMS** - Empowering education through technology