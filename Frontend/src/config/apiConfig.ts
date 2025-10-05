// Read from window.configs if it exists (Choreo deployment)
// Otherwise fall back to local backend URL
const baseUrl = window?.configs?.apiUrl
  ? window.configs.apiUrl
  : "http://localhost:5000"; // local backend

// Handle Choreo API URL structure - it already includes the API path
let apiUrl;
if (baseUrl.includes('choreoapis.dev')) {
  // Choreo API URL already includes the full path, just return baseUrl
  apiUrl = baseUrl;
} else {
  // Local development URL needs /api prefix
  apiUrl = `${baseUrl}/api`;
}

export default apiUrl;
