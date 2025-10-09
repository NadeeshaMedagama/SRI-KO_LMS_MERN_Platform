const mongoose = require('mongoose');
const Announcement = require('./models/Announcement');
const User = require('./models/User');

// Test announcement creation
async function testAnnouncementCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sriko-lms');
    console.log('Connected to MongoDB');

    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const newAdmin = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Admin user created');
    }

    // Test announcement creation
    const testAnnouncement = new Announcement({
      title: 'Test Announcement',
      content: 'This is a test announcement to verify the system is working.',
      type: 'general',
      priority: 'medium',
      targetAudience: 'all',
      isActive: true,
      isPinned: false,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: adminUser._id,
      tags: ['test', 'system']
    });

    await testAnnouncement.save();
    console.log('Test announcement created successfully:', testAnnouncement);

    // Test getting announcements
    const announcements = await Announcement.find().populate('createdBy', 'name email');
    console.log('All announcements:', announcements);

    // Test stats
    const stats = await Announcement.getAnnouncementStats();
    console.log('Announcement stats:', stats);

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAnnouncementCreation();

