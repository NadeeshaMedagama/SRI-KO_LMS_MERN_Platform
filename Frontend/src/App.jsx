import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import JoinUsPage from './pages/JoinUsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import DocumentationPage from './pages/DocumentationPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import PaymentPage from './pages/PaymentPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import MyCoursesPage from './pages/MyCoursesPage';
import LearningProgressPage from './pages/LearningProgressPage';
import PublicProfilePage from './pages/PublicProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminCourseManagementPage from './pages/AdminCourseManagementPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminSubscriptionManagementPage from './pages/AdminSubscriptionManagementPage';
import AdminLayout from './components/AdminLayout';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  // Debug logging
  console.log('🔍 App.jsx - Current state:', { loading, isAuthenticated, user: user?.name });

  if (loading) {
    console.log('🔄 App.jsx - Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <div className="mt-4 text-center">
          <p className="text-gray-600">Loading SRI-KO LMS...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="join-us" element={<JoinUsPage />} />
        <Route path="help-center" element={<HelpCenterPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms-of-service" element={<TermsOfServicePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="payment" element={<PaymentPage />} />
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

      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyCoursesPage />} />
      </Route>

      <Route
        path="/learning-progress"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LearningProgressPage />} />
      </Route>

      <Route
        path="/public-profile"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PublicProfilePage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUserManagementPage />} />
        <Route path="courses" element={<AdminCourseManagementPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionManagementPage />} />
        <Route
          path="certificates"
          element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">Certificates - Coming Soon</h1>
            </div>
          }
        />
        <Route
          path="notifications"
          element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">
                Notifications - Coming Soon
              </h1>
            </div>
          }
        />
        <Route
          path="announcements"
          element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">
                Announcements - Coming Soon
              </h1>
            </div>
          }
        />
        <Route
          path="forums"
          element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">
                Discussion Forums - Coming Soon
              </h1>
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">
                Admin Settings - Coming Soon
              </h1>
            </div>
          }
        />
      </Route>
    </Routes>
    </>
  );
}

export default App;
