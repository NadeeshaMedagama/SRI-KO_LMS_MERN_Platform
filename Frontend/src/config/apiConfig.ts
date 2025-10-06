// Read from window.configs if it exists (Choreo deployment)
// Otherwise fall back to local backend URL
const baseUrl = window?.configs?.apiUrl
  ? window.configs.apiUrl
  : "http://localhost:5000"; // local backend

// Handle API URL structure with multiple fallback options
let apiUrl;
if (baseUrl.includes('choreoapis.dev') || baseUrl.includes('choreoapps.dev')) {
  // Choreo API URL - use the full path as configured
  apiUrl = baseUrl;
  console.log('🔧 Using Choreo API URL:', apiUrl);
} else {
  // Local development URL needs /api prefix
  apiUrl = `${baseUrl}/api`;
  console.log('🔧 Using Local API URL:', apiUrl);
}

// Debug logging for API URL configuration
console.log('🔧 API Configuration Debug:');
console.log('  - Base URL:', baseUrl);
console.log('  - Final API URL:', apiUrl);
console.log('  - Is Choreo:', baseUrl.includes('choreoapis.dev') || baseUrl.includes('choreoapps.dev'));

// Function to test API connectivity and return working URL
export const testApiConnectivity = async (testUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(`${testUrl}/health`, { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok || response.status === 404; // 404 means endpoint exists but method not allowed
  } catch (error) {
    console.log(`❌ API test failed for ${testUrl}:`, error);
    return false;
  }
};

// Function to get working API URL with fallbacks
export const getWorkingApiUrl = async (): Promise<string> => {
  const possibleUrls = [
    apiUrl,
    baseUrl,
    `${baseUrl}/api`,
    baseUrl.replace('/api', ''),
    baseUrl.replace('/api', '') + '/api'
  ];

  console.log('🔍 Testing possible API URLs:', possibleUrls);

  for (const url of possibleUrls) {
    if (await testApiConnectivity(url)) {
      console.log(`✅ Working API URL found: ${url}`);
      return url;
    }
  }

  console.log('⚠️ No working API URL found, using default:', apiUrl);
  return apiUrl;
};

export default apiUrl;
