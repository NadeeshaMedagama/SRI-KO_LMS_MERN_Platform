import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience',
      icon: AcademicCapIcon,
      color: 'blue',
    },
    {
      title: 'Flexible Learning',
      description:
        'Study at your own pace with 24/7 access to course materials',
      icon: ClockIcon,
      color: 'green',
    },
    {
      title: 'Certificates',
      description: 'Earn certificates upon completion to boost your career',
      icon: TrophyIcon,
      color: 'purple',
    },
    {
      title: 'Community Support',
      description:
        'Join a vibrant community of learners and get help when you need it',
      icon: UserGroupIcon,
      color: 'orange',
    },
  ];

  const stats = [
    { label: 'Students Enrolled', value: '10,000+', icon: UsersIcon, color: 'blue' },
    { label: 'Courses Available', value: '500+', icon: BookOpenIcon, color: 'green' },
    { label: 'Expert Instructors', value: '100+', icon: AcademicCapIcon, color: 'purple' },
    { label: 'Success Rate', value: '95%', icon: ChartBarIcon, color: 'orange' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-600',
        text: 'text-blue-600',
        light: 'bg-blue-100',
      },
      green: {
        bg: 'bg-green-600',
        text: 'text-green-600',
        light: 'bg-green-100',
      },
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-600',
        light: 'bg-purple-100',
      },
      orange: {
        bg: 'bg-orange-600',
        text: 'text-orange-600',
        light: 'bg-orange-100',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-yellow-300">SRI-KO LMS</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Empower your learning journey with our comprehensive online
              education platform. Master new skills and advance your career with
              expert-led courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/join-us"
                    className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Join Us Today
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Browse Courses
                    <BookOpenIcon className="ml-2 h-5 w-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-12 w-12 ${colors.light} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide everything you need to succeed in your learning journey
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const Icon = feature.icon;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className={`h-16 w-16 ${colors.light} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-8 w-8 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already advancing their careers
                with our courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/join-us"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Join Our Korean Program
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors"
                >
                  View Pricing
                  <StarIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform provides comprehensive tools and features for effective learning
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Interactive Learning
                </h3>
                <p className="text-gray-600">
                  Engage with interactive content, quizzes, and hands-on projects
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Progress Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor your learning progress with detailed analytics and reports
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrophyIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Achievement System
                </h3>
                <p className="text-gray-600">
                  Earn badges and certificates as you complete courses and milestones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
