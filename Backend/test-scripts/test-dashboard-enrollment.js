// Test script to check enrolled courses in database
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
const User = require('./models/User');
const Course = require('./models/Course');
const Progress = require('./models/Progress');

async function testEnrollment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find().select('name email enrolledCourses');
    console.log('\n📊 All Users:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.enrolledCourses?.length || 0} enrolled courses`);
      if (user.enrolledCourses?.length > 0) {
        console.log(`    Course IDs: ${user.enrolledCourses.map(c => c.toString()).join(', ')}`);
      }
    });
    
    // Get all progress records
    const progressRecords = await Progress.find().populate('student course');
    console.log('\n📊 Progress Records:');
    console.log(`  Total: ${progressRecords.length}`);
    progressRecords.forEach(p => {
      console.log(`  - Student: ${p.student?.name || p.student}, Course: ${p.course?.title || p.course}`);
    });
    
    // Get all published courses
    const courses = await Course.find({ isPublished: true }).select('title instructor');
    console.log('\n📊 Published Courses:');
    console.log(`  Total: ${courses.length}`);
    courses.forEach(c => {
      console.log(`  - ${c.title} (ID: ${c._id})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEnrollment();
