#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? './config.production.env'
  : process.env.NODE_ENV === 'test'
    ? './config.test.env'
    : './config.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

async function checkAnalytics() {
  try {
    console.log('🔍 Checking Analytics Issue\n');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Mongo URI:', process.env.MONGO_URI ? 'Set' : 'Not set');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Progress = require('../models/Progress');
    const User = require('../models/User');
    const Course = require('../models/Course');

    // 1. Check all completed progress records
    const allCompleted = await Progress.find({ isCompleted: true })
      .populate('student', 'name email role')
      .populate('course', 'title')
      .sort({ completionDate: -1 });

    console.log('=== ALL COMPLETED COURSES ===');
    console.log(`Total: ${allCompleted.length}\n`);

    allCompleted.forEach((prog, idx) => {
      console.log(`[${idx + 1}] ${prog.course?.title || 'N/A'}`);
      console.log(`    Student: ${prog.student?.name || 'N/A'} (${prog.student?.email || 'N/A'})`);
      console.log(`    Role: ${prog.student?.role || 'N/A'}`);
      console.log(`    isCompleted: ${prog.isCompleted}`);
      console.log(`    completionDate: ${prog.completionDate || 'NOT SET'}`);
      console.log(`    updatedAt: ${prog.updatedAt}`);
      console.log('');
    });

    // 2. Check this month's range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('=== THIS MONTH RANGE ===');
    console.log(`Start: ${monthStart.toISOString()}`);
    console.log(`End: ${monthEnd.toISOString()}\n`);

    // 3. Check completions this month WITH completionDate
    const thisMonthWithDate = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`Completions this month (with completionDate): ${thisMonthWithDate}`);

    // 4. Check completions this month WITHOUT completionDate filter (using updatedAt)
    const thisMonthByUpdated = await Progress.countDocuments({
      isCompleted: true,
      updatedAt: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`Completions this month (by updatedAt): ${thisMonthByUpdated}`);

    // 5. Check students
    const students = await User.find({ role: 'student' }).select('_id name email');
    const studentIds = students.map(s => s._id);

    console.log(`\nTotal students: ${students.length}`);
    students.forEach(s => console.log(`  - ${s.name} (${s.email})`));

    // 6. Check completions by students only
    const studentCompletionsWithDate = await Progress.countDocuments({
      student: { $in: studentIds },
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`\nStudent completions this month (with completionDate): ${studentCompletionsWithDate}`);

    const studentCompletionsByUpdated = await Progress.countDocuments({
      student: { $in: studentIds },
      isCompleted: true,
      updatedAt: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`Student completions this month (by updatedAt): ${studentCompletionsByUpdated}`);

    // 7. Find records missing completionDate
    const missingCompletionDate = await Progress.find({
      isCompleted: true,
      $or: [
        { completionDate: null },
        { completionDate: { $exists: false } }
      ]
    }).populate('student', 'name email role').populate('course', 'title');

    console.log(`\n=== RECORDS MISSING completionDate ===`);
    console.log(`Total: ${missingCompletionDate.length}\n`);

    missingCompletionDate.forEach((prog, idx) => {
      console.log(`[${idx + 1}] ${prog.course?.title || 'N/A'}`);
      console.log(`    Student: ${prog.student?.name || 'N/A'} (${prog.student?.role || 'N/A'})`);
      console.log(`    isCompleted: ${prog.isCompleted}`);
      console.log(`    completionDate: ${prog.completionDate || 'NOT SET'}`);
      console.log(`    updatedAt: ${prog.updatedAt}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAnalytics();

