// Auto-detect environment and set appropriate API URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDevelopment = window.location.port === '5173' || window.location.port === '5174' || window.location.port === '3000';

window.configs = {
    // Use localhost for local development, Choreo URL for production
    apiUrl: (isLocalhost && isDevelopment) 
        ? 'http://localhost:5000'  // Local development
        : 'https://bfdef01f-7fc1-46ea-af69-42279e15f710-dev.e1-us-east-azure.choreoapis.dev/sri-ko-lms-platform/backend/v1', // Choreo deployment
    featureFlags: {
        enableNewFeature: true,
        enableExperimentalFeature: false,
    },
};