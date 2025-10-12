// Test the announcement service API calls
const testAnnouncementAPI = async () => {
  try {
    // Test the API URL resolution
    const { getWorkingApiUrl } = await import('./config/apiConfig.ts');
    const workingApiUrl = await getWorkingApiUrl();
    console.log('Working API URL:', workingApiUrl);

    // Test announcement stats endpoint
    const token = 'test-token'; // This would be a real token in the actual app
    const response = await fetch(`${workingApiUrl}/announcements/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Announcement stats:', data);
    } else {
      const errorData = await response.json();
      console.log('Error response:', errorData);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAnnouncementAPI();

