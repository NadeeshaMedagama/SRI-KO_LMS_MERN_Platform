/**
 * Central API Configuration for SRI-KO LMS
 * Supports both Choreo deployment and local development
 */

// Define the configuration interface
export interface ApiConfig {
  apiUrl: string;
  timeout: number;
  featureFlags: {
    enableNewFeature: boolean;
    enableExperimentalFeature: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
  };
  endpoints: {
    auth: string;
    courses: string;
    users: string;
    payments: string;
    subscriptions: string;
    admin: string;
  };
}

// Get configuration from window.config (set by config.js) or environment variables
const getConfig = (): ApiConfig => {
  // Check if window.config exists (from config.js)
  if (typeof window !== 'undefined' && (window as any).config) {
    const windowConfig = (window as any).config;
    return {
      apiUrl: windowConfig.apiUrl || 'http://localhost:5000/api',
      timeout: windowConfig.timeout || 10000,
      featureFlags: {
        enableNewFeature: windowConfig.featureFlags?.enableNewFeature ?? true,
        enableExperimentalFeature: windowConfig.featureFlags?.enableExperimentalFeature ?? false,
        enableAnalytics: windowConfig.featureFlags?.enableAnalytics ?? true,
        enableNotifications: windowConfig.featureFlags?.enableNotifications ?? true,
      },
      endpoints: {
        auth: '/auth',
        courses: '/courses',
        users: '/users',
        payments: '/payments',
        subscriptions: '/subscriptions',
        admin: '/admin',
      },
    };
  }

  // Fallback to environment variables for local development
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    featureFlags: {
      enableNewFeature: import.meta.env.VITE_ENABLE_NEW_FEATURE === 'true',
      enableExperimentalFeature: import.meta.env.VITE_ENABLE_EXPERIMENTAL_FEATURE === 'true',
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
      enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    },
    endpoints: {
      auth: '/auth',
      courses: '/courses',
      users: '/users',
      payments: '/payments',
      subscriptions: '/subscriptions',
      admin: '/admin',
    },
  };
};

// Export the configuration
export const apiConfig: ApiConfig = getConfig();

// Helper functions for easy access
export const getApiUrl = (): string => apiConfig.apiUrl;
export const getTimeout = (): number => apiConfig.timeout;
export const getFeatureFlag = (flag: keyof ApiConfig['featureFlags']): boolean => 
  apiConfig.featureFlags[flag];
export const getEndpoint = (endpoint: keyof ApiConfig['endpoints']): string => 
  apiConfig.endpoints[endpoint];

// Log configuration for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('SRI-KO LMS API Configuration:', apiConfig);
}
