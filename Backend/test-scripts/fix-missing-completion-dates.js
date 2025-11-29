#!/usr/bin/env node

/**
 * Fix Completed Courses Without completionDate
 * Sets completionDate for all completed courses that are missing it
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Course = require('../models/Course');

console.log('🔧 Fixing Completed Courses Without completionDate\n');

async function fixCompletedCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all completed courses
    const allCompleted = await Progress.find({ isCompleted: true })
      .populate('student', 'name email role')
      .populate('course', 'title');

    console.log(`📊 Total completed courses: ${allCompleted.length}\n`);

    if (allCompleted.length === 0) {
      console.log('ℹ️  No completed courses found in database.');
      console.log('   This means the student hasn\'t actually completed the course yet.');
      console.log('   They need to click "Complete Course" button or call the API endpoint.\n');
      return;
    }

    // Find those without completionDate
    const withoutDate = allCompleted.filter(p => !p.completionDate);

    console.log(`📋 Breakdown:`);
    console.log(`   With completionDate: ${allCompleted.length - withoutDate.length}`);
    console.log(`   Without completionDate: ${withoutDate.length} ${withoutDate.length > 0 ? '⚠️' : '✅'}\n`);

    if (withoutDate.length === 0) {
      console.log('✅ All completed courses have completionDate set!');
      console.log('   The issue must be elsewhere.\n');

      // Show what's in the database
      console.log('📊 Completed Courses in Database:');
      console.log('═'.repeat(70));
      allCompleted.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name} (${prog.student?.role})`);
        console.log(`   Course: ${prog.course?.title}`);
        console.log(`   Completed: ${prog.completionDate?.toLocaleDateString()}`);
        console.log(`   Will appear in analytics: ${prog.student?.role === 'student' ? 'YES ✅' : 'NO (not a student)'}\n`);
      });

      return;
    }

    console.log('🔧 Fixing Records Without completionDate:');
    console.log('═'.repeat(70));

    let fixed = 0;
    for (const progress of withoutDate) {
      // Set completionDate to updatedAt (when they last updated progress)
      // or createdAt if updatedAt not available
      // or now as fallback
      const dateToUse = progress.updatedAt || progress.createdAt || new Date();

      console.log(`Fixing: ${progress.student?.name} - ${progress.course?.title}`);
      console.log(`   Setting completionDate to: ${dateToUse.toLocaleDateString()}`);

      progress.completionDate = dateToUse;
      await progress.save();

      fixed++;
    }

    console.log(`\n✅ Fixed ${fixed} record(s)!\n`);

    // Verify the fix
    console.log('📋 VERIFICATION:');
    console.log('═'.repeat(70));

    const afterFix = await Progress.find({ isCompleted: true });
    const stillMissing = afterFix.filter(p => !p.completionDate);

    console.log(`Total completed: ${afterFix.length}`);
    console.log(`With completionDate: ${afterFix.length - stillMissing.length}`);
    console.log(`Still missing: ${stillMissing.length}\n`);

    if (stillMissing.length === 0) {
      console.log('✅ SUCCESS! All completed courses now have completionDate\n');

      // Calculate what will show in analytics
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const thisMonth = await Progress.countDocuments({
        isCompleted: true,
        completionDate: { $gte: monthStart, $lte: monthEnd }
      });

      console.log('📊 ANALYTICS PREVIEW:');
      console.log('═'.repeat(70));
      console.log(`Course completions this month: ${thisMonth}`);
      console.log('\n💡 Refresh the admin analytics page to see the updated value!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

fixCompletedCourses();

