import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const location = useLocation();
  const googleData = location.state?.googleData;

  const [formData, setFormData] = useState({
    name: googleData?.name || '',
    email: googleData?.email || '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [isGoogleSignup, setIsGoogleSignup] = useState(!!googleData);

  const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(formData.password);
  const passwordTouched = formData.password.length > 0;

  const { register, googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (isGoogleSignup) {
      // Complete Google signup with selected role
      const result = await googleLogin(googleData.credential, formData.role);
      if (result.success) {
        navigate('/dashboard');
      }
    } else {
      if (!passwordValid) {
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
      );
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  const handleGoogleCredentialResponse = async (credentialResponse) => {
    // Decode the credential to get user info
    const base64Url = credentialResponse.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);

    // Navigate to register page with Google data
    navigate('/register', {
      state: {
        googleData: {
          credential: credentialResponse.credential,
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="/sri-ko-logo.png" 
              alt="SRI-KO Foreign Language Training Center" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input-field mt-1"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={isGoogleSignup}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={isGoogleSignup}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Account Type
              </label>
              <select
                id="role"
                name="role"
                className="input-field mt-1"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            {!isGoogleSignup && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`input-field mt-1 ${passwordTouched && !passwordValid ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {passwordTouched && !passwordValid ? (
                    <p className="mt-1 text-xs text-red-600">
                      At least 6 characters with one uppercase letter, one lowercase letter, and one number.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      At least 6 characters with one uppercase letter, one lowercase letter, and one number.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input-field mt-1"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (!isGoogleSignup && !passwordValid)}
              className={`w-full btn-primary ${loading || (!isGoogleSignup && !passwordValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating account...' : (isGoogleSignup ? 'Complete Registration' : 'Create account')}
            </button>
          </div>

          {!isGoogleSignup && (
            <>
              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-50 px-3 text-gray-500">Or register with</span>
                </div>
              </div>

              {/* Google Sign Up */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleCredentialResponse}
                  onError={() => console.error('Google signup failed')}
                  useOneTap={false}
                  width="368"
                  text="signup_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
