import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockCourses = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React, Node.js and more',
        instructor: 'John Doe',
        duration: 12,
        price: 99,
        thumbnail: '',
        level: 'beginner',
        category: 'programming',
      },
      {
        id: 2,
        title: 'UI/UX Design Fundamentals',
        description:
          'Master the principles of user interface and user experience design',
        instructor: 'Jane Smith',
        duration: 8,
        price: 149,
        thumbnail: '',
        level: 'intermediate',
        category: 'design',
      },
    ];

    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="loading-spinner inline-block" />
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from a wide range of courses designed by industry experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <div className="card hover:shadow-lg transition-shadow duration-200">
                <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Course Image</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    by {course.instructor}
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ${course.price}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.level === 'beginner'
                        ? 'bg-green-100 text-green-800'
                        : course.level === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {course.level.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {course.duration} weeks
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No courses available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
