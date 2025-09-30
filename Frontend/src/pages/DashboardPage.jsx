import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here&apos;s your learning dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enrolled Courses
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {user?.enrolledCourses?.length || 0}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Completed Lessons
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Certificates Earned
            </h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="card">
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
