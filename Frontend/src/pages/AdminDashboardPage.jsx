import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  // DocumentTextIcon,
  CogIcon,
  // EyeIcon,
  // PencilIcon,
  // TrashIcon,
  // PlusIcon,
  UserGroupIcon,
  BookOpenIcon,
  TrophyIcon,
  // ChatBubbleLeftRightIcon,
  // ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 0,
    completedCourses: 0,
    pendingApprovals: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const baseUrl = window?.configs?.apiUrl || 'http://localhost:5000';

      // Fetch statistics
      try {
        const statsResponse = await fetch(`${baseUrl}/api/admin/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('Stats response:', statsData);
          if (statsData.success) {
            setStats(statsData.stats);
            console.log('Stats loaded:', statsData.stats);
          } else {
            console.error('Stats API returned error:', statsData.message);
            toast.error(statsData.message || 'Failed to load statistics');
          }
        } else {
          const errorData = await statsResponse.json();
          console.error('Stats API error:', errorData);
          toast.error(errorData.message || 'Failed to load statistics');
        }
      } catch (statsError) {
        console.error('Stats fetch error:', statsError);
        toast.error('Failed to load statistics');
      }

      // Fetch recent users
      try {
        const usersResponse = await fetch(`${baseUrl}/api/admin/users?limit=5`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log('Users response:', usersData);
          if (usersData.success) {
            setRecentUsers(usersData.users || []);
            console.log('Users loaded:', usersData.users);
          } else {
            console.error('Users API returned error:', usersData.message);
            toast.error(usersData.message || 'Failed to load users');
          }
        } else {
          const errorData = await usersResponse.json();
          console.error('Users API error:', errorData);
          toast.error(errorData.message || 'Failed to load users');
        }
      } catch (usersError) {
        console.error('Users fetch error:', usersError);
        toast.error('Failed to load users');
      }

      // Fetch recent courses
      try {
        const coursesResponse = await fetch(`${baseUrl}/api/admin/courses?limit=5`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log('Courses response:', coursesData);
          if (coursesData.success) {
            setRecentCourses(coursesData.courses || []);
            console.log('Courses loaded:', coursesData.courses);
          } else {
            console.error('Courses API returned error:', coursesData.message);
            toast.error(coursesData.message || 'Failed to load courses');
          }
        } else {
          const errorData = await coursesResponse.json();
          console.error('Courses API error:', errorData);
          toast.error(errorData.message || 'Failed to load courses');
        }
      } catch (coursesError) {
        console.error('Courses fetch error:', coursesError);
        toast.error('Failed to load courses');
      }

      // Note: Activities endpoint might not exist, so we'll handle it gracefully
      try {
        const activitiesResponse = await fetch(`${baseUrl}/api/admin/activities?limit=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          if (activitiesData.success) {
            setRecentActivities(activitiesData.activities || []);
          }
        }
      } catch (activitiesError) {
        console.log('Activities endpoint not available:', activitiesError);
        setRecentActivities([]);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRoleBadgeColor = role => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Debug: Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-500">
            Debug: API URL: {window?.configs?.apiUrl || 'http://localhost:5000'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back! Here&apos;s what&apos;s happening with your LMS.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Information:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            <p>Token value: {localStorage.getItem('token') ? localStorage.getItem('token').substring(0, 20) + '...' : 'None'}</p>
            <p>API URL: {window?.configs?.apiUrl || 'http://localhost:5000'}</p>
            <p>Current URL: {window.location.href}</p>
            <p>Port: {window.location.port}</p>
            <p>Stats loaded: {JSON.stringify(stats)}</p>
            <p>Users count: {recentUsers.length}</p>
            <p>Courses count: {recentCourses.length}</p>
            <p>Loading state: {loading ? 'Yes' : 'No'}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Retry Fetch
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Completed Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedCourses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and edit users</p>
              </div>
            </Link>

            <Link
              to="/admin/courses"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpenIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Courses</p>
                <p className="text-sm text-gray-500">View and edit courses</p>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-500">
                  View reports and insights
                </p>
              </div>
            </Link>

            <Link
              to="/admin/subscriptions"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Subscriptions</p>
                <p className="text-sm text-gray-500">
                  Manage payments and revenue
                </p>
              </div>
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CogIcon className="h-6 w-6 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">System configuration</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Users
                </h2>
                <Link
                  to="/admin/users"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Courses
                </h2>
                <Link
                  to="/admin/courses"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentCourses.map(course => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {course.title?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {course.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {course.enrolledStudents?.length || 0} students
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(course.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activities
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BellIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
