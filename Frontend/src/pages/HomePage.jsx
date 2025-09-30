import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HomePage = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience',
      icon: '👨‍🏫'
    },
    {
      title: 'Flexible Learning',
      description: 'Study at your own pace with 24/7 access to course materials',
      icon: '🕒'
    },
    {
      title: 'Certificates',
      description: 'Earn certificates upon completion to boost your career',
      icon: '🏆'
    },
    {
      title: 'Community Support',
      description: 'Join a vibrant community of learners and get help when you need it',
      icon: '👥'
    }
  ]

  const stats = [
    { label: 'Students Enrolled', value: '10,000+' },
    { label: 'Courses Available', value: '500+' },
    { label: 'Expert Instructors', value: '100+' },
    { label: 'Success Rate', value: '95%' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="text-yellow-300">SRI-KO LMS</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Empower your learning journey with our comprehensive online education platform. 
              Master new skills and advance your career with expert-led courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors duration-200">
                    Get Started Free
                  </Link>
                  <Link to="/courses" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200">
                    Browse Courses
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already advancing their careers with our courses.
            </p>
            <Link to="/register" className="btn-secondary">
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
