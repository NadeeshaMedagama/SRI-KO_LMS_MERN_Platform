import { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      console.log('🔄 AuthReducer - UPDATE_USER action:', action.payload);
      console.log('🔄 AuthReducer - Current user:', state.user);
      const updatedUser = { ...state.user, ...action.payload };
      console.log('🔄 AuthReducer - Updated user:', updatedUser);
      return {
        ...state,
        user: updatedUser,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Wait for config to be available
          let baseUrl = 'http://localhost:5000';
          if (window.configs?.apiUrl) {
            baseUrl = window.configs.apiUrl;
          } else {
            // Wait a bit for config to load
            await new Promise(resolve => setTimeout(resolve, 100));
            baseUrl = window.configs?.apiUrl || 'http://localhost:5000';
          }

          const response = await fetch(`${baseUrl}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: data.user,
                  token,
                },
              });
            } else {
              localStorage.removeItem('token');
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          // No token, just set loading to false
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      } finally {
        // Always set loading to false, even if there's an error
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const baseUrl = window?.configs?.apiUrl || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const { token, user } = data;
          localStorage.setItem('token', token);

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });

          // Check if user is admin and store admin data
          if (user.role === 'admin') {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
          }

          toast.success('Login successful!');
          return { success: true, user };
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (name, email, password, role = 'student') => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const authResponse = await apiService.register({ name, email, password, role });
      const { token, user } = authResponse;

      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateUser = userData => {
    console.log('🔄 AuthContext - Updating user with:', userData);
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
    console.log('✅ AuthContext - User updated');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
