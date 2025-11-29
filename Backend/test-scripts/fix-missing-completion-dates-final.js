#!/usr/bin/env node

/**
 * Fix Missing completionDate for Completed Courses
 * This script finds all Progress records with isCompleted=true but no completionDate
 * and sets the completionDate to their updatedAt timestamp
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? './config.production.env'
  : process.env.NODE_ENV === 'test'
    ? './config.test.env'
    : './config.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

async function fixMissingCompletionDates() {
  try {
    console.log('🔧 Fixing Missing completionDate Fields\n');
    console.log('==========================================\n');

    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment');
      console.error('   Please ensure config.env exists and contains MONGO_URI');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Progress = require('../models/Progress');
    const User = require('../models/User');
    const Course = require('../models/Course');

    // Step 1: Find all completed courses without completionDate
    console.log('📋 Step 1: Finding completed courses without completionDate...\n');

    const missingCompletionDate = await Progress.find({
      isCompleted: true,
      $or: [
        { completionDate: null },
        { completionDate: { $exists: false } }
      ]
    })
    .populate('student', 'name email role')
    .populate('course', 'title');

    console.log(`Found ${missingCompletionDate.length} record(s) needing fix\n`);

    if (missingCompletionDate.length === 0) {
      console.log('✅ All completed courses already have completionDate set!');
      console.log('   No fixes needed.\n');
    } else {
      console.log('Records to fix:\n');
      missingCompletionDate.forEach((prog, idx) => {
        console.log(`[${idx + 1}] ${prog.course?.title || 'N/A'}`);
        console.log(`    Student: ${prog.student?.name || 'N/A'} (${prog.student?.email || 'N/A'})`);
        console.log(`    Role: ${prog.student?.role || 'N/A'}`);
        console.log(`    Updated At: ${prog.updatedAt}`);
        console.log('');
      });

      // Step 2: Fix them
      console.log('🔧 Step 2: Fixing records...\n');

      let fixedCount = 0;
      for (const prog of missingCompletionDate) {
        // Set completionDate to updatedAt (when it was last modified/completed)
        prog.completionDate = prog.updatedAt;
        await prog.save();
        fixedCount++;
        console.log(`✅ Fixed [${fixedCount}/${missingCompletionDate.length}]: ${prog.course?.title || 'N/A'}`);
      }

      console.log(`\n✅ Successfully fixed ${fixedCount} record(s)\n`);
    }

    // Step 3: Verify the fix
    console.log('==========================================');
    console.log('📊 Step 3: Verifying Analytics Data\n');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log(`Current Month: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}\n`);

    // Count all completions this month
    const thisMonthCompletions = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`Completions this month: ${thisMonthCompletions}`);

    // Count previous month for growth calculation
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setTime(prevMonthEnd.getTime() - 1);

    const prevMonthCompletions = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    console.log(`Completions previous month: ${prevMonthCompletions}`);

    // Calculate growth
    let growth = 0;
    if (prevMonthCompletions === 0) {
      growth = thisMonthCompletions > 0 ? 100 : 0;
    } else {
      growth = Number((((thisMonthCompletions - prevMonthCompletions) / prevMonthCompletions) * 100).toFixed(1));
    }

    console.log(`Growth: ${growth > 0 ? '+' : ''}${growth}%\n`);

    // Show details of this month's completions
    if (thisMonthCompletions > 0) {
      console.log('Details of this month\'s completions:\n');
      const completions = await Progress.find({
        isCompleted: true,
        completionDate: { $gte: monthStart, $lte: monthEnd }
      })
      .populate('student', 'name email role')
      .populate('course', 'title')
      .sort({ completionDate: -1 });

      completions.forEach((prog, idx) => {
        console.log(`[${idx + 1}] ${prog.course?.title || 'N/A'}`);
        console.log(`    Student: ${prog.student?.name || 'N/A'} (${prog.student?.email || 'N/A'})`);
        console.log(`    Role: ${prog.student?.role || 'N/A'}`);
        console.log(`    Completed: ${prog.completionDate.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Step 4: Summary
    console.log('==========================================');
    console.log('📊 SUMMARY\n');
    console.log(`✅ Fixed ${missingCompletionDate.length} record(s) with missing completionDate`);
    console.log(`✅ Current month completions: ${thisMonthCompletions}`);
    console.log(`✅ Previous month completions: ${prevMonthCompletions}`);
    console.log(`✅ Growth: ${growth > 0 ? '+' : ''}${growth}%\n`);

    console.log('🎯 NEXT STEPS:');
    console.log('1. Restart your server: npm start');
    console.log('2. The Progress model now has automatic completionDate setting');
    console.log('3. Any future course completions will automatically have completionDate set');
    console.log('4. Analytics should now show correct completion counts\n');

    console.log('==========================================\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
    console.log('✅ Fix complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixMissingCompletionDates();

