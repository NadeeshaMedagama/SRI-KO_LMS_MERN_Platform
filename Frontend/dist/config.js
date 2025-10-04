// SRI-KO LMS Configuration
// Supports both Choreo deployment and local development
window.configs = {
    // API Configuration
    apiUrl: (function() {
        // Check for Choreo environment variables first
        if (typeof process !== 'undefined' && process.env && process.env.CHOREO_API_URL) {
            return process.env.CHOREO_API_URL;
        }
        
        // Check for runtime environment variables (Choreo deployment)
        if (typeof window !== 'undefined' && window.location) {
            const hostname = window.location.hostname;
            
            // If deployed on Choreo, use the Choreo API URL
            if (hostname.includes('choreo') || hostname.includes('azure') || hostname.includes('wso2')) {
                // This will be replaced by Choreo deployment process
                return 'https://your-choreo-api-url.choreoapis.dev/sri-ko-lms/express-mongo-backend/v1';
            }
        }
        
        // Fallback to localhost for development
        return 'http://localhost:5000';
    })(),
};
