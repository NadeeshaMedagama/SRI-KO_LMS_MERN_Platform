import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiUrl, { getWorkingApiUrl } from '../config/apiConfig';
import apiService from '../services/apiService';
import announcementService from '../services/announcementService';
import discussionForumService from '../services/discussionForumService';
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
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAnnouncements();
    fetchForums();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      console.log('🔧 Dashboard API Debug:');
      console.log('  - Token exists:', !!token);

      // Use apiService instead of direct fetch to ensure proper authentication
      const response = await apiService.get('/users/dashboard');
      
      console.log('📊 Dashboard Response:');
      console.log('  - Status:', response.status);
      console.log('  - Data:', response.data);

      if (response.data.success) {
        console.log('✅ Dashboard Data:', response.data.data);
        setDashboardData(response.data.data);
      } else {
        console.error('❌ Dashboard API Error:', response.data.message);
        toast.error(response.data.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Dashboard Error:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        // Token will be cleared by apiService interceptor
      } else {
        toast.error('Failed to load dashboard data - Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      console.log('🔍 Dashboard: Fetching announcements...');
      const response = await announcementService.getActiveAnnouncements();
      console.log('📊 Dashboard: Announcements response:', response);
      if (response && response.success && Array.isArray(response.announcements)) {
        console.log('✅ Dashboard: Setting announcements:', response.announcements);
        setAnnouncements(response.announcements);
      } else {
        console.log('❌ Dashboard: No valid announcements data, setting empty array');
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching announcements:', error);
      console.error('❌ Dashboard: Error details:', error.response?.data);
      // Do not toast here to avoid noisy UI on dashboard load
      setAnnouncements([]);
    }
  };

  const fetchForums = async () => {
    try {
      const response = await discussionForumService.getForums();
      if (response.success) {
        setForums(response.forums);
      }
    } catch (error) {
      console.error('Error fetching forums:', error);
      // Don't show error toast for forums as it's not critical
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <SpeakerWaveIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
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

        {/* Main Content */}
        <div>
          {/* Discussion Forums */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Discussion Forums</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {forums.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {forums.slice(0, 6).map((forum) => (
                      <div key={forum._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-medium text-gray-900 mr-3">
                                {forum.title}
                              </h3>
                              {forum.isPinned && (
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              )}
                              {forum.isLocked && (
                                <svg className="w-4 h-4 text-red-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                forum.category === 'korean-basics' ? 'bg-blue-100 text-blue-800' :
                                forum.category === 'grammar' ? 'bg-green-100 text-green-800' :
                                forum.category === 'vocabulary' ? 'bg-purple-100 text-purple-800' :
                                forum.category === 'pronunciation' ? 'bg-yellow-100 text-yellow-800' :
                                forum.category === 'conversation' ? 'bg-pink-100 text-pink-800' :
                                forum.category === 'culture' ? 'bg-indigo-100 text-indigo-800' :
                                forum.category === 'study-tips' ? 'bg-orange-100 text-orange-800' :
                                forum.category === 'homework-help' ? 'bg-red-100 text-red-800' :
                                forum.category === 'resources' ? 'bg-teal-100 text-teal-800' :
                                forum.category === 'events' ? 'bg-cyan-100 text-cyan-800' :
                                forum.category === 'introductions' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {forum.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                forum.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                forum.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                forum.level === 'advanced' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {forum.level.charAt(0).toUpperCase() + forum.level.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">
                              {forum.description.length > 150
                                ? `${forum.description.substring(0, 150)}...`
                                : forum.description
                              }
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{forum.postCount} posts</span>
                              <span className="mx-2">•</span>
                              <span>Created by {forum.createdBy?.name}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(forum.createdAt)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/forums/${forum._id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Forum
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {forums.length > 6 && (
                      <div className="p-6 text-center border-t border-gray-200">
                        <Link
                          to="/forums"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View All Forums ({forums.length} total)
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No discussion forums</h3>
                    <p className="text-gray-600">There are no active discussion forums at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Announcements</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {announcements.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {announcements.map((a, idx) => (
                      <div key={a._id || idx} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {a.title}
                              </h3>
                              {a.isPinned && (
                                <svg className="w-4 h-4 text-yellow-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {a.content}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                {a.type || 'general'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                                a.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                a.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                a.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {a.priority || 'medium'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                {a.targetAudience === 'all' ? 'All Users' : (a.targetAudience || '').charAt(0).toUpperCase() + (a.targetAudience || '').slice(1)}
                              </span>
                              <span className="text-gray-500">
                                {a.startDate ? new Date(a.startDate).toLocaleDateString() : ''}
                                {a.endDate ? `  B7 Ends ${new Date(a.endDate).toLocaleDateString()}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <SpeakerWaveIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements</h3>
                    <p className="text-gray-600">There are no active announcements at the moment.</p>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
