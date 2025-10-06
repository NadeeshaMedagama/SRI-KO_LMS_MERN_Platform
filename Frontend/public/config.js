// Auto-detect environment and set appropriate API URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = window.location.port === '5173' || window.location.port === '5174' || window.location.port === '5175' || window.location.port === '3000';

window.configs = {
    // Use localhost for local development, Choreo URL for production
    apiUrl: (isLocalhost && isDevelopment) 
        ? 'http://localhost:5000'  // Local development
        : 'https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev/choreo-apis/sri-ko-lms-platform/backend/v1/api', // Choreo deployment with correct URL
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
    // Choreo-specific configuration
    choreo: {
        enabled: !isLocalhost || !isDevelopment,
        baseUrl: 'https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev/choreo-apis/sri-ko-lms-platform/backend/v1'
    }
};

// Debug logging for configuration
console.log('🔧 Public Config Debug:');
console.log('  - Hostname:', window.location.hostname);
console.log('  - Port:', window.location.port);
console.log('  - Is Localhost:', isLocalhost);
console.log('  - Is Development:', isDevelopment);
console.log('  - API URL:', window.configs.apiUrl);