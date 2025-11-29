#!/usr/bin/env node

/**
 * Check Course Completions in Database
 * Verify if completed courses are being saved correctly
 */

const mongoose = require('mongoose');

async function checkCompletions() {
  try {
    console.log('🔍 Checking Course Completions in Database\n');

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
      title: String
    }, { timestamps: true });

    const progressSchema = new mongoose.Schema({
      student: { type: mongoose.Schema.ObjectId, ref: 'User' },
      course: { type: mongoose.Schema.ObjectId, ref: 'Course' },
      isCompleted: Boolean,
      completionDate: Date,
      overallProgress: Number,
      createdAt: Date,
      updatedAt: Date
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);
    const Progress = mongoose.model('Progress', progressSchema);

    // Check all completed courses
    console.log('📊 ALL COMPLETED COURSES:');
    console.log('═'.repeat(70));

    const allCompleted = await Progress.find({ isCompleted: true })
      .populate('student', 'name email role')
      .populate('course', 'title')
      .sort({ completionDate: -1 });

    console.log(`Total completed: ${allCompleted.length}\n`);

    if (allCompleted.length === 0) {
      console.log('❌ NO COMPLETED COURSES FOUND!\n');
      console.log('This explains why analytics shows 0 completions.\n');
    } else {
      allCompleted.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name || 'Unknown'} (${prog.student?.role || 'unknown'})`);
        console.log(`   Email: ${prog.student?.email || 'N/A'}`);
        console.log(`   Course: ${prog.course?.title || 'Unknown'}`);
        console.log(`   isCompleted: ${prog.isCompleted} ${prog.isCompleted ? '✅' : '❌'}`);
        console.log(`   completionDate: ${prog.completionDate || 'NOT SET ❌'}`);
        console.log(`   Progress: ${prog.overallProgress}%`);
        console.log(`   Created: ${prog.createdAt}`);
        console.log(`   Updated: ${prog.updatedAt}\n`);
      });
    }

    // Check this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('📅 THIS MONTH COMPLETIONS:');
    console.log('═'.repeat(70));
    console.log(`Month: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}\n`);

    const thisMonth = await Progress.find({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    }).populate('student', 'name role').populate('course', 'title');

    console.log(`Count: ${thisMonth.length}\n`);

    if (thisMonth.length === 0) {
      console.log('❌ No completions found this month with completionDate set!\n');

      // Check if there are completed courses without completionDate
      const completedNoDate = await Progress.find({
        isCompleted: true,
        $or: [
          { completionDate: { $exists: false } },
          { completionDate: null }
        ]
      }).populate('student', 'name role').populate('course', 'title');

      if (completedNoDate.length > 0) {
        console.log('⚠️  FOUND COMPLETED COURSES WITHOUT completionDate:');
        console.log('═'.repeat(70));
        completedNoDate.forEach((prog, i) => {
          console.log(`${i + 1}. ${prog.student?.name} - ${prog.course?.title}`);
          console.log(`   isCompleted: ${prog.isCompleted} ✅`);
          console.log(`   completionDate: ${prog.completionDate || 'NULL ❌'}`);
          console.log(`   This needs to be fixed!\n`);
        });
      }
    } else {
      thisMonth.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name} (${prog.student?.role})`);
        console.log(`   Course: ${prog.course?.title}`);
        console.log(`   Completed: ${prog.completionDate?.toLocaleString()}\n`);
      });
    }

    // Check only students
    console.log('📊 STUDENT COMPLETIONS ONLY (for analytics):');
    console.log('═'.repeat(70));

    const studentCompletions = await Progress.find({
      isCompleted: true,
      completionDate: { $exists: true, $ne: null }
    })
    .populate({
      path: 'student',
      select: 'name email role',
      match: { role: 'student' }
    })
    .populate('course', 'title');

    const validStudentCompletions = studentCompletions.filter(p => p.student !== null);

    console.log(`Total (all roles): ${allCompleted.length}`);
    console.log(`With completionDate: ${studentCompletions.length}`);
    console.log(`Students only: ${validStudentCompletions.length}\n`);

    if (validStudentCompletions.length > 0) {
      validStudentCompletions.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student.name} - ${prog.course?.title}`);
        console.log(`   Completed: ${prog.completionDate?.toLocaleDateString()}\n`);
      });
    }

    console.log('📋 SUMMARY FOR ANALYTICS:');
    console.log('═'.repeat(70));
    console.log(`Total completed courses: ${allCompleted.length}`);
    console.log(`This month: ${thisMonth.length}`);
    console.log(`Students only (this month): ${thisMonth.filter(p => p.student?.role === 'student').length}`);
    console.log('\nThis is what should appear in admin analytics!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkCompletions();

