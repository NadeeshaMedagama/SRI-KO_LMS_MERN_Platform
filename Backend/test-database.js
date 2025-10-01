const mongoose = require('mongoose');
const User = require('./models/User');

// Test database connection and user model
async function testDatabase() {
  try {
    // Connect to MongoDB (you'll need to set your connection string)
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sri-ko-lms';

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Test user creation with new fields
    console.log('\nTesting user creation with new fields...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      bio: 'This is a test user bio',
      phone: '+1234567890',
      location: 'New York, NY',
      website: 'https://testuser.com',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/testuser',
        twitter: 'https://twitter.com/testuser',
        github: 'https://github.com/testuser',
      },
      notifications: {
        emailNotifications: true,
        courseUpdates: true,
        assignmentReminders: true,
        systemAnnouncements: true,
        marketingEmails: false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showCourses: true,
        allowMessages: true,
      },
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    // Test user retrieval
    console.log('\nTesting user retrieval...');
    const retrievedUser = await User.findById(testUser._id);
    console.log('✅ User retrieved successfully');
    console.log('User data:', {
      name: retrievedUser.name,
      email: retrievedUser.email,
      role: retrievedUser.role,
      bio: retrievedUser.bio,
      phone: retrievedUser.phone,
      location: retrievedUser.location,
      website: retrievedUser.website,
      socialLinks: retrievedUser.socialLinks,
      notifications: retrievedUser.notifications,
      privacy: retrievedUser.privacy,
    });

    // Test user update
    console.log('\nTesting user update...');
    const updatedUser = await User.findByIdAndUpdate(
      testUser._id,
      {
        bio: 'Updated bio',
        phone: '+0987654321',
        'notifications.marketingEmails': true,
        'privacy.profileVisibility': 'private',
      },
      { new: true },
    );
    console.log('✅ User updated successfully');
    console.log('Updated fields:', {
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      marketingEmails: updatedUser.notifications.marketingEmails,
      profileVisibility: updatedUser.privacy.profileVisibility,
    });

    // Clean up test user
    console.log('\nCleaning up test user...');
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user deleted successfully');

    console.log('\n🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDatabase();
