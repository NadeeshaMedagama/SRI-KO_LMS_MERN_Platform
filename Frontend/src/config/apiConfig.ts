// Read from window.configs if it exists (Choreo deployment)
// Otherwise fall back to local backend URL
const baseUrl = window?.configs?.apiUrl
  ? window.configs.apiUrl
  : "http://localhost:5000"; // local backend

// Handle API URL structure
let apiUrl;
if (baseUrl.includes('choreoapis.dev') || baseUrl.includes('choreoapps.dev')) {
  // Choreo API URL already includes the full path with /api, just return baseUrl
  apiUrl = baseUrl;
} else {
  // Local development URL needs /api prefix
  apiUrl = `${baseUrl}/api`;
}

// Debug logging for API URL configuration
console.log('🔧 API Configuration Debug:');
console.log('  - Base URL:', baseUrl);
console.log('  - Final API URL:', apiUrl);
console.log('  - Is Choreo:', baseUrl.includes('choreoapis.dev') || baseUrl.includes('choreoapps.dev'));

export default apiUrl;
