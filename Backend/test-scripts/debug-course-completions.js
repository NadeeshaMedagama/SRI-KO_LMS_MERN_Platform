#!/usr/bin/env node

/**
 * Debug Course Completions
 * Check why course completions aren't showing in analytics
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Progress = require('../models/Progress');

console.log('🔍 Debugging Course Completions\n');

async function debugCourseCompletions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all completed courses
    console.log('📊 ALL COMPLETED COURSES:');
    console.log('═'.repeat(60));

    const allCompleted = await Progress.find({ isCompleted: true })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ completionDate: -1 });

    if (allCompleted.length === 0) {
      console.log('❌ NO COMPLETED COURSES FOUND!');
      console.log('   Possible reasons:');
      console.log('   1. No courses have been completed yet');
      console.log('   2. isCompleted flag is not set to true');
      console.log('   3. Database connection issue');
    } else {
      console.log(`✅ Found ${allCompleted.length} completed course(s)\n`);

      allCompleted.forEach((prog, index) => {
        console.log(`${index + 1}. Course: ${prog.course?.title || 'Unknown'}`);
        console.log(`   Student: ${prog.student?.name || 'Unknown'}`);
        console.log(`   Completed: ${prog.isCompleted ? 'YES' : 'NO'}`);
        console.log(`   Completion Date: ${prog.completionDate || 'NOT SET ❌'}`);
        console.log(`   Progress: ${prog.overallProgress}%`);
        console.log(`   Created At: ${prog.createdAt}`);
        console.log('');
      });
    }

    // Check this month's completions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('📅 THIS MONTH\'S COMPLETIONS:');
    console.log('═'.repeat(60));
    console.log(`Month: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}\n`);

    const thisMonth = await Progress.find({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    }).populate('student', 'name').populate('course', 'title');

    console.log(`Count: ${thisMonth.length}`);
    if (thisMonth.length > 0) {
      thisMonth.forEach((prog, index) => {
        console.log(`${index + 1}. ${prog.course?.title} - ${prog.student?.name} (${prog.completionDate?.toLocaleDateString()})`);
      });
    } else {
      console.log('❌ No completions this month');
    }
    console.log('');

    // Check last month's completions
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setTime(prevMonthEnd.getTime() - 1);

    console.log('📅 LAST MONTH\'S COMPLETIONS:');
    console.log('═'.repeat(60));
    console.log(`Month: ${prevMonthStart.toLocaleDateString()} - ${prevMonthEnd.toLocaleDateString()}\n`);

    const lastMonth = await Progress.find({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    }).populate('student', 'name').populate('course', 'title');

    console.log(`Count: ${lastMonth.length}`);
    if (lastMonth.length > 0) {
      lastMonth.forEach((prog, index) => {
        console.log(`${index + 1}. ${prog.course?.title} - ${prog.student?.name} (${prog.completionDate?.toLocaleDateString()})`);
      });
    } else {
      console.log('❌ No completions last month');
    }
    console.log('');

    // Calculate growth
    const thisMonthCount = thisMonth.length;
    const lastMonthCount = lastMonth.length;

    let growth = 0;
    if (lastMonthCount === 0) {
      growth = thisMonthCount > 0 ? 100 : 0;
    } else {
      growth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }

    console.log('📈 GROWTH CALCULATION:');
    console.log('═'.repeat(60));
    console.log(`This Month: ${thisMonthCount}`);
    console.log(`Last Month: ${lastMonthCount}`);
    console.log(`Growth: ${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`);
    console.log('');

    // Check for completions without completionDate
    console.log('⚠️  CHECKING FOR ISSUES:');
    console.log('═'.repeat(60));

    const completedWithoutDate = await Progress.find({
      isCompleted: true,
      completionDate: { $exists: false }
    });

    const completedWithNullDate = await Progress.find({
      isCompleted: true,
      completionDate: null
    });

    if (completedWithoutDate.length > 0 || completedWithNullDate.length > 0) {
      console.log(`❌ Found ${completedWithoutDate.length + completedWithNullDate.length} completed courses WITHOUT completionDate!`);
      console.log('   This will cause them to NOT appear in analytics.');
      console.log('   Fix needed: Set completionDate for these records.');
    } else {
      console.log('✅ All completed courses have completionDate set');
    }
    console.log('');

    // Summary
    console.log('📋 SUMMARY:');
    console.log('═'.repeat(60));
    console.log(`Total Completed Courses: ${allCompleted.length}`);
    console.log(`This Month: ${thisMonthCount}`);
    console.log(`Last Month: ${lastMonthCount}`);
    console.log(`Expected Analytics Value: ${thisMonthCount} (${growth > 0 ? '+' : ''}${growth.toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

debugCourseCompletions();

