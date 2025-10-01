import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminCourseManagementPage from './pages/AdminCourseManagementPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminLayout';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsPage />} />
      </Route>

      <Route
        path="/courses/create"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CreateCoursePage />} />
      </Route>

      <Route
        path="/courses/:id/edit"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EditCoursePage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUserManagementPage />} />
        <Route path="courses" element={<AdminCourseManagementPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="payments" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Payment Gateway - Coming Soon</h1></div>} />
        <Route path="certificates" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Certificates - Coming Soon</h1></div>} />
        <Route path="notifications" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Notifications - Coming Soon</h1></div>} />
        <Route path="announcements" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Announcements - Coming Soon</h1></div>} />
        <Route path="forums" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Discussion Forums - Coming Soon</h1></div>} />
        <Route path="settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Admin Settings - Coming Soon</h1></div>} />
      </Route>
    </Routes>
  );
}

export default App;
