#!/usr/bin/env node

/**
 * Fix Analytics Course Completions Issue
 * 1. Fix missing completionDate for completed courses
 * 2. Verify analytics calculation
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

async function fixAnalytics() {
  try {
    console.log('🔧 Fixing Analytics Course Completions\n');

    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Progress = require('../models/Progress');
    const User = require('../models/User');

    // 1. Find all completed courses without completionDate
    console.log('=== STEP 1: Finding completed courses without completionDate ===');
    const missingCompletionDate = await Progress.find({
      isCompleted: true,
      $or: [
        { completionDate: null },
        { completionDate: { $exists: false } }
      ]
    }).populate('student', 'name email role').populate('course', 'title');

    console.log(`Found ${missingCompletionDate.length} records missing completionDate\n`);

    if (missingCompletionDate.length > 0) {
      console.log('Records to fix:');
      missingCompletionDate.forEach((prog, idx) => {
        console.log(`  [${idx + 1}] ${prog.course?.title || 'N/A'}`);
        console.log(`      Student: ${prog.student?.name || 'N/A'} (${prog.student?.role || 'N/A'})`);
        console.log(`      Updated: ${prog.updatedAt}`);
      });

      // Fix them
      console.log('\n🔧 Fixing missing completionDate fields...');
      let fixedCount = 0;
      for (const prog of missingCompletionDate) {
        // Use updatedAt as completionDate since that's when it was last modified
        prog.completionDate = prog.updatedAt;
        await prog.save();
        fixedCount++;
      }
      console.log(`✅ Fixed ${fixedCount} records\n`);
    }

    // 2. Verify current month's completions
    console.log('=== STEP 2: Verifying this month\'s completions ===');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log(`Current month: ${monthStart.toISOString()} to ${monthEnd.toISOString()}\n`);

    // Get ALL completions this month (regardless of role)
    const allCompletionsThisMonth = await Progress.find({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    }).populate('student', 'name email role').populate('course', 'title');

    console.log(`Total completions this month (all roles): ${allCompletionsThisMonth.length}`);

    if (allCompletionsThisMonth.length > 0) {
      console.log('\nCompletions by role:');
      const byRole = {};
      allCompletionsThisMonth.forEach(prog => {
        const role = prog.student?.role || 'unknown';
        byRole[role] = (byRole[role] || 0) + 1;
      });
      Object.entries(byRole).forEach(([role, count]) => {
        console.log(`  ${role}: ${count}`);
      });

      console.log('\nDetails:');
      allCompletionsThisMonth.forEach((prog, idx) => {
        console.log(`  [${idx + 1}] ${prog.course?.title || 'N/A'}`);
        console.log(`      Student: ${prog.student?.name || 'N/A'} (${prog.student?.email || 'N/A'})`);
        console.log(`      Role: ${prog.student?.role || 'N/A'}`);
        console.log(`      Completed: ${prog.completionDate}`);
      });
    }

    // 3. Check previous month for growth calculation
    console.log('\n=== STEP 3: Checking previous month for growth calculation ===');
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setTime(prevMonthEnd.getTime() - 1);

    console.log(`Previous month: ${prevMonthStart.toISOString()} to ${prevMonthEnd.toISOString()}`);

    const prevMonthCompletions = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    console.log(`Previous month completions: ${prevMonthCompletions}`);

    // Calculate growth percentage
    const calculateGrowthPercentage = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const growth = calculateGrowthPercentage(allCompletionsThisMonth.length, prevMonthCompletions);
    console.log(`Growth: ${growth > 0 ? '+' : ''}${growth}%`);

    // 4. Show summary
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Fixed ${missingCompletionDate.length} records with missing completionDate`);
    console.log(`✅ Current month completions: ${allCompletionsThisMonth.length}`);
    console.log(`✅ Previous month completions: ${prevMonthCompletions}`);
    console.log(`✅ Growth percentage: ${growth > 0 ? '+' : ''}${growth}%`);

    console.log('\n⚠️  IMPORTANT NOTE:');
    console.log('The analytics endpoint currently filters by role="student" only.');
    console.log('If instructors/admins are completing courses, they won\'t be counted.');
    console.log('You may need to update the analytics endpoint to count all completions.');

    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAnalytics();

