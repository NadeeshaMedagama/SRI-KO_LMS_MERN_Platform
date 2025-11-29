#!/usr/bin/env node

/**
 * Direct Database Query - Test Analytics Calculation
 * This bypasses the API and directly calculates what analytics should show
 */

const mongoose = require('mongoose');
const path = require('path');

const envFile = './config.env';
require('dotenv').config({ path: envFile });

async function testAnalytics() {
  try {
    console.log('🧪 Testing Analytics Calculation Directly\n');
    console.log('==========================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Progress = require('../models/Progress');

    // Get current month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log(`📅 Current Month: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}\n`);

    // THIS IS EXACTLY WHAT THE ANALYTICS ENDPOINT SHOULD DO:
    const courseCompletionsThisMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`📊 Course Completions This Month: ${courseCompletionsThisMonth}\n`);

    // Get previous month
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setTime(prevMonthEnd.getTime() - 1);

    const courseCompletionsPrevMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    console.log(`📊 Course Completions Previous Month: ${courseCompletionsPrevMonth}\n`);

    // Calculate growth
    let growth = 0;
    if (courseCompletionsPrevMonth === 0) {
      growth = courseCompletionsThisMonth > 0 ? 100 : 0;
    } else {
      growth = Number((((courseCompletionsThisMonth - courseCompletionsPrevMonth) / courseCompletionsPrevMonth) * 100).toFixed(1));
    }

    console.log(`📈 Growth: ${growth > 0 ? '+' : ''}${growth}%\n`);

    console.log('==========================================');
    console.log('✅ WHAT ANALYTICS PAGE SHOULD SHOW:\n');
    console.log(`   Course Completions: ${courseCompletionsThisMonth}`);
    console.log(`   Growth: ${growth > 0 ? '+' : ''}${growth}%\n`);
    console.log('==========================================\n');

    // Show details
    const completions = await Progress.find({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    })
    .populate('student', 'name email role')
    .populate('course', 'title')
    .sort({ completionDate: -1 });

    console.log('Details:\n');
    completions.forEach((prog, idx) => {
      console.log(`[${idx + 1}] ${prog.course?.title || 'N/A'}`);
      console.log(`    Student: ${prog.student?.name || 'N/A'} (${prog.student?.role || 'N/A'})`);
      console.log(`    Completed: ${prog.completionDate?.toLocaleDateString()}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('🔌 Disconnected\n');

    console.log('⚠️  IF ANALYTICS PAGE SHOWS 0:');
    console.log('1. Server needs to be restarted with updated code');
    console.log('2. Browser cache needs to be cleared');
    console.log('3. Check browser console for errors\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAnalytics();

