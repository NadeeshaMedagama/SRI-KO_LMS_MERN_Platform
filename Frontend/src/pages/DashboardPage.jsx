import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiUrl, { getWorkingApiUrl } from '../config/apiConfig';
import {
  BookOpenIcon,
  CheckCircleIcon,
  TrophyIcon,
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlayIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // Try to get a working API URL
      const workingApiUrl = await getWorkingApiUrl();
      const dashboardUrl = `${workingApiUrl}/users/dashboard`;
      
      console.log('🔧 Dashboard API Debug:');
      console.log('  - Default API URL:', apiUrl);
      console.log('  - Working API URL:', workingApiUrl);
      console.log('  - Dashboard URL:', dashboardUrl);
      console.log('  - Token exists:', !!token);

      const response = await fetch(dashboardUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📊 Dashboard Response:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard Data:', data);
        if (data.success) {
          setDashboardData(data.data);
        } else {
          console.error('❌ Dashboard API Error:', data.message);
          toast.error(data.message || 'Failed to load dashboard data');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Dashboard HTTP Error:', errorData);
        toast.error(errorData.message || `Failed to load dashboard data (${response.status})`);
      }
    } catch (error) {
      console.error('❌ Dashboard Network Error:', error);
      toast.error('Failed to load dashboard data - Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'programming':
        return 'bg-blue-100 text-blue-800';
      case 'design':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-green-100 text-green-800';
      case 'marketing':
        return 'bg-orange-100 text-orange-800';
      case 'lifestyle':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <p className="text-gray-600">Failed to load dashboard data</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { statistics, enrolledCourses, recentActivity } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here&apos;s your learning dashboard
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalEnrolledCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalCompletedLessons}
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
                <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.certificatesEarned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(statistics.totalTimeSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <Link
              to="/courses"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Browse all courses →
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpenIcon className="h-16 w-16 text-white" />
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
                        {course.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">
                          {course.progress.completedLessons}/{course.progress.totalLessons} lessons
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress.overallProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {course.progress.overallProgress}% complete
                        </span>
                        {course.progress.isCompleted && (
                          <span className="text-xs text-green-600 font-medium">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatTime(course.progress.timeSpent)}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {course.progress.lastAccessed ? formatDate(course.progress.lastAccessed) : 'Never'}
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center mb-4">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {course.instructor?.name || 'Unknown Instructor'}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/courses/${course._id}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      {course.progress.isCompleted ? 'Review Course' : 'Continue Learning'}
                    </Link>

                    {/* Certificate Badge */}
                    {course.progress.certificate && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <TrophyIcon className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800 font-medium">
                            Certificate Earned
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course!</p>
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <ChartBarIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Progress updated in {activity.courseTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.progress}% complete
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDate(activity.lastAccessed)}
                        </p>
                        {activity.isCompleted && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-600">Start learning to see your activity here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
