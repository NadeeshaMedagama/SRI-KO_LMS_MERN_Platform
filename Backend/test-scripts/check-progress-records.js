#!/usr/bin/env node

/**
 * Check Progress Records
 * Find students who may have "completed" but not marked as isCompleted
 */

const mongoose = require('mongoose');

async function checkProgress() {
  try {
    console.log('🔍 Checking All Progress Records\n');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

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
      overallProgress: Number
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);
    const Progress = mongoose.model('Progress', progressSchema);

    // Check all progress records
    const allProgress = await Progress.find()
      .populate('student', 'name email role')
      .populate('course', 'title')
      .sort({ overallProgress: -1 });

    console.log(`📊 Total Progress Records: ${allProgress.length}\n`);

    if (allProgress.length === 0) {
      console.log('❌ NO PROGRESS RECORDS FOUND!\n');
      console.log('This means no one has enrolled in any courses.\n');
      return;
    }

    // Categorize progress
    const completed = allProgress.filter(p => p.isCompleted === true);
    const high = allProgress.filter(p => p.overallProgress === 100 && !p.isCompleted);
    const inProgress = allProgress.filter(p => p.overallProgress > 0 && p.overallProgress < 100);
    const notStarted = allProgress.filter(p => !p.overallProgress || p.overallProgress === 0);

    console.log('📈 PROGRESS BREAKDOWN:');
    console.log('═'.repeat(70));
    console.log(`Marked as completed (isCompleted=true): ${completed.length}`);
    console.log(`100% progress but NOT marked complete: ${high.length} ${high.length > 0 ? '⚠️' : ''}`);
    console.log(`In progress (1-99%): ${inProgress.length}`);
    console.log(`Not started (0%): ${notStarted.length}\n`);

    // Show 100% but not completed
    if (high.length > 0) {
      console.log('⚠️  STUDENTS WITH 100% BUT NOT MARKED COMPLETE:');
      console.log('═'.repeat(70));
      console.log('These should be marked as completed!\n');

      high.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name} (${prog.student?.role})`);
        console.log(`   Email: ${prog.student?.email}`);
        console.log(`   Course: ${prog.course?.title}`);
        console.log(`   Progress: ${prog.overallProgress}% ✅`);
        console.log(`   isCompleted: ${prog.isCompleted} ❌`);
        console.log(`   completionDate: ${prog.completionDate || 'NOT SET ❌'}\n`);
      });

      console.log('💡 SOLUTION: These records need to be marked as completed!\n');
    }

    // Show completed records
    if (completed.length > 0) {
      console.log('✅ PROPERLY COMPLETED COURSES:');
      console.log('═'.repeat(70));

      completed.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name} (${prog.student?.role})`);
        console.log(`   Course: ${prog.course?.title}`);
        console.log(`   Progress: ${prog.overallProgress}%`);
        console.log(`   isCompleted: ${prog.isCompleted} ✅`);
        console.log(`   completionDate: ${prog.completionDate || 'NOT SET ❌'}\n`);
      });
    }

    // Show in progress
    if (inProgress.length > 0) {
      console.log('📚 IN PROGRESS:');
      console.log('═'.repeat(70));

      inProgress.slice(0, 5).forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name} - ${prog.course?.title}`);
        console.log(`   Progress: ${prog.overallProgress}%\n`);
      });

      if (inProgress.length > 5) {
        console.log(`   ... and ${inProgress.length - 5} more\n`);
      }
    }

    // Check students specifically
    const studentProgress = allProgress.filter(p => p.student?.role === 'student');
    console.log('👥 STUDENT PROGRESS SUMMARY:');
    console.log('═'.repeat(70));
    console.log(`Total students with progress: ${studentProgress.length}`);
    console.log(`Students completed: ${studentProgress.filter(p => p.isCompleted).length}`);
    console.log(`Students at 100% (not marked): ${studentProgress.filter(p => p.overallProgress === 100 && !p.isCompleted).length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

checkProgress();

