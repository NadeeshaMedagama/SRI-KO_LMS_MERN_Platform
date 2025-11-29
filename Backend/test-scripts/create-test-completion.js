#!/usr/bin/env node

/**
 * Test Course Completion
 * Creates test data to verify course completion analytics
 */

const mongoose = require('mongoose');

async function createTestCompletion() {
  try {
    console.log('🧪 Creating Test Course Completion\n');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }, { timestamps: true });

    const courseSchema = new mongoose.Schema({
      title: String,
      enrolledStudents: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
    }, { timestamps: true });

    const progressSchema = new mongoose.Schema({
      student: { type: mongoose.Schema.ObjectId, ref: 'User' },
      course: { type: mongoose.Schema.ObjectId, ref: 'Course' },
      isCompleted: Boolean,
      completionDate: Date,
      overallProgress: Number
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);
    const Progress = mongoose.model('Progress', progressSchema);

    // Find or create a test student
    let student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('❌ No students found in database!');
      console.log('   Please create a student account first.');
      process.exit(1);
    }

    console.log(`✅ Found student: ${student.name} (${student.email})`);

    // Find or create a test course
    let course = await Course.findOne();
    if (!course) {
      console.log('❌ No courses found in database!');
      console.log('   Please create a course first.');
      process.exit(1);
    }

    console.log(`✅ Found course: ${course.title}\n`);

    // Check if student is enrolled
    if (!course.enrolledStudents.includes(student._id)) {
      console.log('📝 Enrolling student in course...');
      course.enrolledStudents.push(student._id);
      await course.save();
      console.log('✅ Student enrolled\n');
    } else {
      console.log('✅ Student already enrolled\n');
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      student: student._id,
      course: course._id
    });

    if (!progress) {
      console.log('📝 Creating progress record...');
      progress = new Progress({
        student: student._id,
        course: course._id,
        isCompleted: false,
        overallProgress: 0
      });
      await progress.save();
      console.log('✅ Progress record created\n');
    }

    // Check if already completed
    if (progress.isCompleted) {
      console.log('ℹ️  This course is already marked as completed!');
      console.log(`   Completion Date: ${progress.completionDate}`);
      console.log('\n   If you want to test again, you can:');
      console.log('   1. Use a different course');
      console.log('   2. Manually reset this progress record in MongoDB');
    } else {
      console.log('🎯 Marking course as completed...');

      progress.isCompleted = true;
      progress.completionDate = new Date();
      progress.overallProgress = 100;
      await progress.save();

      console.log('✅ Course marked as completed!\n');
      console.log('📋 Details:');
      console.log(`   Student: ${student.name}`);
      console.log(`   Course: ${course.title}`);
      console.log(`   Completion Date: ${progress.completionDate}`);
      console.log(`   Progress: ${progress.overallProgress}%\n`);
    }

    // Calculate this month's stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart.getTime() - 1);

    const lastMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    let growth = 0;
    if (lastMonth === 0) {
      growth = thisMonth > 0 ? 100 : 0;
    } else {
      growth = Number((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1));
    }

    console.log('📊 Analytics Preview:');
    console.log('═'.repeat(60));
    console.log(`Course Completions: ${thisMonth}  (${growth > 0 ? '+' : ''}${growth}%)`);
    console.log('\nℹ️  This should now appear in your admin analytics dashboard!');
    console.log('   Refresh the page to see the updated values.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createTestCompletion();

