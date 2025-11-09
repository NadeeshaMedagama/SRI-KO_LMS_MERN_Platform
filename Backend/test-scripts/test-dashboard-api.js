const axios = require('axios');
require('dotenv').config({ path: './config.env' });

// Test the dashboard API endpoint
async function testDashboardAPI() {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:5000';
    
    console.log('🔧 Testing Dashboard API...');
    console.log(`📡 API URL: ${API_URL}/api/users/dashboard`);
    
    // First, login as a test user who has enrolled courses
    console.log('\n📝 Step 1: Login as test user...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'instructor1@example.com', // User with 6 enrolled courses
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`👤 User: ${loginResponse.data.user.name}`);
    
    // Fetch dashboard data
    console.log('\n📊 Step 2: Fetching dashboard data...');
    const dashboardResponse = await axios.get(`${API_URL}/api/users/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!dashboardResponse.data.success) {
      console.log('❌ Dashboard fetch failed:', dashboardResponse.data.message);
      return;
    }
    
    const data = dashboardResponse.data.data;
    console.log('✅ Dashboard data fetched successfully\n');
    
    // Display statistics
    console.log('📊 STATISTICS:');
    console.log('━'.repeat(50));
    console.log(`📚 Total Enrolled Courses:  ${data.statistics.totalEnrolledCourses}`);
    console.log(`✅ Completed Lessons:       ${data.statistics.totalCompletedLessons}`);
    console.log(`🏆 Certificates Earned:     ${data.statistics.certificatesEarned}`);
    console.log(`⏱️  Time Spent:              ${data.statistics.totalTimeSpent} minutes`);
    console.log(`📈 Completed Courses:       ${data.statistics.completedCourses}`);
    console.log('━'.repeat(50));
    
    // Display enrolled courses
    console.log(`\n📚 ENROLLED COURSES (${data.enrolledCourses.length}):`);
    console.log('━'.repeat(50));
    data.enrolledCourses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Category: ${course.category} | Level: ${course.level}`);
      console.log(`   Progress: ${course.progress.overallProgress}%`);
      console.log(`   Completed: ${course.progress.completedLessons}/${course.progress.totalLessons} lessons`);
      console.log(`   Time: ${course.progress.timeSpent} minutes`);
      console.log(`   Status: ${course.progress.isCompleted ? '✅ Completed' : '🔄 In Progress'}`);
    });
    
    // Display recent activity
    console.log(`\n\n📝 RECENT ACTIVITY (${data.recentActivity.length}):`);
    console.log('━'.repeat(50));
    data.recentActivity.forEach((activity, index) => {
      const date = new Date(activity.lastAccessed).toLocaleDateString();
      console.log(`${index + 1}. ${activity.courseTitle} - ${activity.progress}% (${date})`);
    });
    
    // Check if statistics match actual data
    console.log('\n\n🔍 VALIDATION:');
    console.log('━'.repeat(50));
    const actualEnrolled = data.enrolledCourses.length;
    const reportedEnrolled = data.statistics.totalEnrolledCourses;
    
    if (actualEnrolled === reportedEnrolled) {
      console.log(`✅ Enrolled courses count matches: ${actualEnrolled}`);
    } else {
      console.log(`❌ MISMATCH: Actual (${actualEnrolled}) != Reported (${reportedEnrolled})`);
    }
    
    const actualCompletedLessons = data.enrolledCourses.reduce((sum, c) => 
      sum + (c.progress.completedLessons || 0), 0
    );
    const reportedCompletedLessons = data.statistics.totalCompletedLessons;
    
    if (actualCompletedLessons === reportedCompletedLessons) {
      console.log(`✅ Completed lessons count matches: ${actualCompletedLessons}`);
    } else {
      console.log(`❌ MISMATCH: Actual (${actualCompletedLessons}) != Reported (${reportedCompletedLessons})`);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error testing dashboard API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testDashboardAPI();
