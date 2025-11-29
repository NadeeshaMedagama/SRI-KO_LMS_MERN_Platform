#!/usr/bin/env node

/**
 * Fix Course Completions - Set completionDate for existing completed courses
 * This script fixes Progress records that have isCompleted=true but no completionDate
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');

console.log('🔧 Fixing Course Completion Dates\n');

async function fixCompletionDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all completed courses without completionDate
    const completedWithoutDate = await Progress.find({
      isCompleted: true,
      $or: [
        { completionDate: { $exists: false } },
        { completionDate: null }
      ]
    });

    console.log(`📊 Found ${completedWithoutDate.length} completed course(s) without completionDate\n`);

    if (completedWithoutDate.length === 0) {
      console.log('✅ All completed courses already have completionDate set!');
      console.log('   No fixes needed.');
    } else {
      console.log('🔧 Fixing records...\n');

      let fixed = 0;
      for (const progress of completedWithoutDate) {
        // Set completionDate to updatedAt (or createdAt if updatedAt not available)
        progress.completionDate = progress.updatedAt || progress.createdAt || new Date();
        await progress.save();
        fixed++;

        console.log(`✅ Fixed: Course ID ${progress.course}, Student ID ${progress.student}`);
        console.log(`   Set completionDate to: ${progress.completionDate}`);
      }

      console.log(`\n✅ Fixed ${fixed} record(s)!`);
    }

    // Verify the fix
    console.log('\n📋 VERIFICATION:');
    console.log('═'.repeat(60));

    const allCompleted = await Progress.countDocuments({ isCompleted: true });
    const completedWithDate = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $exists: true, $ne: null }
    });

    console.log(`Total Completed Courses: ${allCompleted}`);
    console.log(`With completionDate: ${completedWithDate}`);
    console.log(`Without completionDate: ${allCompleted - completedWithDate}`);

    if (allCompleted === completedWithDate) {
      console.log('\n✅ ALL GOOD! All completed courses now have completionDate');
    } else {
      console.log(`\n⚠️  WARNING: ${allCompleted - completedWithDate} course(s) still missing completionDate`);
    }

    // Show this month's completions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`\n📅 Completions this month: ${thisMonth}`);
    console.log('   This should now appear in the analytics!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

fixCompletionDates();

