import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/sri-ko-logo.png" 
                alt="SRI-KO Foreign Language Training Center" 
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold">SRI-KO LMS</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering learners worldwide with our comprehensive learning
              management system. Learn, grow, and achieve your goals with our
              expertly crafted courses.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                📘 Facebook
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                🐦 Twitter
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                💼 LinkedIn
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/courses"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/join-us"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/join-us#get-in-touch"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help-center"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SRI-KO Learning Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
