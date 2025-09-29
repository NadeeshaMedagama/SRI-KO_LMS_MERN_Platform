# SRI-KO Learning Management System (LMS) - MERN Platform

A comprehensive Learning Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Tailwind CSS.

## 🌟 Features

### ✅ Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access
- **Course Management** - Create, edit, delete courses with curriculum
- **Student Enrollment** - Browse and enroll in courses
- **Progress Tracking** - Track learning progress and completion
- **Responsive Design** - Modern UI with Tailwind CSS
- **Authentication System** - Secure login/logout with protected routes

### 🔄 Coming Soon
- Payment Integration
- Certificate Generation
- Discussion Forums
- Video Streaming
- Assignment System
- Quiz Engine
- Advanced Analytics

## 🛠 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
-**.mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **nodemon** - Development server

### Frontend
- **React 18** - Frontend library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **React Hot Toast** - Toast notifications
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library

## 📁 Project Structure

```
SRI-KO_LMS_MERN_Platform/
├── Backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication & validation
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── env.example      # Environment variables template
├── Frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # App entry point
│   ├── package.json     # Frontend dependencies
│   ├── vite.config.js   # Vite configuration
│   ├── tailwind.config.js # Tailwind configuration
│   └── env.example     # Environment variables template
├── package.json         # Root package.json
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. **Clone and setup**
   ```bash
   git clone <your-repo-url>
   cd SRI-KO_LMS_MERN_Platform
   npm run install-all
   ```

2. **Environment Setup**
   
   **Backend (.env):**
   ```bash
   cd Backend
   cp env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   ```

   **Frontend (.env):**
   ```bash
   cd Frontend
   cp env.example .env
   # Edit .env with your API URL
   ```

3. **Start Development Servers**
   
   **Option A: Start both servers together**
   ```bash
   npm install concurrently
   npm run dev
   ```
   
   **Option B: Start servers individually**
   
   Terminal 1 (Backend):
   ```bash
   cd Backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd Frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - API Health Check: http://localhost:5000/api/health

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sri-ko-lms
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout (client-side)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (instructor/admin only)
- `PUT /api/courses/:id` - Update course (instructor/admin only)
- `DELETE /api/courses/:id` - Delete course (instructor/admin only)
- `POST /api/courses/:id/enroll` - Enroll in course (student only)
- `GET /api/courses/my-courses` - Get enrolled courses
- `POST /api/courses/:id/reviews` - Add course review

## 👥 User Roles

- **Student**: Can browse and enroll in courses, track progress
- **Instructor**: Can create and manage courses, view enrolled students
- **Admin**: Full system access and management

## 🎨 UI Components

The application uses a modern design system with:
- Custom Tailwind CSS configuration with brand colors
- Responsive design (mobile-first approach)
- Accessible components with Headless UI
- Toast notifications for user feedback
- Loading states and error handling

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Request rate limiting
- CORS protection
- Input validation and sanitization
- Protected API routes

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- 📱 Mobile devices (320px+)
- 📷 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@sriko.com or create an issue in this repository.

---

**Built with ❤️ for the future of online education**