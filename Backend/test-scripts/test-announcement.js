const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import the Announcement model
const Announcement = require('./models/Announcement');
const User = require('./models/User');

async function createTestAnnouncement() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user to create the announcement
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Creating one...');
      const newAdmin = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Created admin user');
    }

    const creator = adminUser || await User.findOne({ role: 'admin' });

    // Create a test announcement
    const testAnnouncement = new Announcement({
      title: 'Welcome to SRI-KO LMS!',
      content: 'Welcome to our Learning Management System. This is a test announcement to verify that the announcement system is working correctly.',
      type: 'general',
      priority: 'medium',
      targetAudience: 'all',
      isActive: true,
      isPinned: false,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      createdBy: creator._id,
      tags: ['welcome', 'test']
    });

    await testAnnouncement.save();
    console.log('✅ Test announcement created successfully');
    console.log('📢 Announcement details:', {
      title: testAnnouncement.title,
      targetAudience: testAnnouncement.targetAudience,
      isActive: testAnnouncement.isActive,
      startDate: testAnnouncement.startDate,
      endDate: testAnnouncement.endDate
    });

    // Test the getActiveAnnouncements method
    console.log('\n🔍 Testing getActiveAnnouncements method...');
    const activeAnnouncements = await Announcement.getActiveAnnouncements('students');
    console.log('📊 Active announcements found:', activeAnnouncements.length);
    console.log('📊 Announcements:', activeAnnouncements.map(a => ({
      title: a.title,
      targetAudience: a.targetAudience,
      isActive: a.isActive
    })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestAnnouncement();