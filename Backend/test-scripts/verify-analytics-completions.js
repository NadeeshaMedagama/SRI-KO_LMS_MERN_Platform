#!/usr/bin/env node

/**
 * Verify Analytics Course Completions Fix
 * Shows what SHOULD appear in analytics (students only)
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

console.log('🔍 Verifying Analytics Course Completions\n');

async function verifyAnalytics() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get date ranges
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('📅 CURRENT MONTH:');
    console.log(`   ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}\n`);

    // Get ALL completed courses this month
    console.log('📊 ALL COMPLETED COURSES THIS MONTH:');
    console.log('═'.repeat(70));

    const allCompleted = await Progress.find({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    })
    .populate('student', 'name email role')
    .populate('course', 'title');

    console.log(`Total: ${allCompleted.length}\n`);

    if (allCompleted.length === 0) {
      console.log('❌ NO COMPLETED COURSES FOUND THIS MONTH!\n');
      console.log('Possible reasons:');
      console.log('1. No courses completed this month');
      console.log('2. Courses marked complete but no completionDate set');
      console.log('3. completionDate is from a different month\n');

      // Check if there are ANY completed courses at all
      const anyCompleted = await Progress.find({ isCompleted: true })
        .populate('student', 'name email role')
        .populate('course', 'title')
        .sort({ completionDate: -1 })
        .limit(5);

      if (anyCompleted.length > 0) {
        console.log('⚠️  But found completed courses from other months:');
        anyCompleted.forEach((prog, i) => {
          console.log(`${i + 1}. ${prog.student?.name} (${prog.student?.role})`);
          console.log(`   Course: ${prog.course?.title}`);
          console.log(`   Completed: ${prog.completionDate?.toLocaleDateString() || 'No date'}\n`);
        });
      }
    } else {
      // Show breakdown by role
      const byRole = {};
      allCompleted.forEach(prog => {
        const role = prog.student?.role || 'unknown';
        byRole[role] = (byRole[role] || 0) + 1;
      });

      console.log('By Role:');
      Object.entries(byRole).forEach(([role, count]) => {
        const icon = role === 'student' ? '✅' : '⚠️';
        console.log(`   ${role}: ${count} ${icon}`);
      });
      console.log('');

      // Show details
      allCompleted.forEach((prog, i) => {
        const icon = prog.student?.role === 'student' ? '✅' : '❌';
        console.log(`${i + 1}. ${prog.student?.name} (${prog.student?.role}) ${icon}`);
        console.log(`   Email: ${prog.student?.email}`);
        console.log(`   Course: ${prog.course?.title}`);
        console.log(`   Completed: ${prog.completionDate?.toLocaleDateString()}`);
        console.log(`   Counts in Analytics: ${prog.student?.role === 'student' ? 'YES ✅' : 'NO (not a student) ❌'}\n`);
      });
    }

    // Get student IDs
    const students = await User.find({ role: 'student' }).select('_id name email');
    const studentIds = students.map(s => s._id);

    console.log('👥 STUDENTS IN DATABASE:');
    console.log('═'.repeat(70));
    console.log(`Total students: ${students.length}\n`);

    if (students.length > 0) {
      students.slice(0, 5).forEach((student, i) => {
        console.log(`${i + 1}. ${student.name} - ${student.email}`);
      });
      if (students.length > 5) {
        console.log(`   ... and ${students.length - 5} more`);
      }
      console.log('');
    }

    // Count completions by STUDENTS ONLY
    const studentCompletions = await Progress.countDocuments({
      student: { $in: studentIds },
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log('📊 ANALYTICS CALCULATION (STUDENTS ONLY):');
    console.log('═'.repeat(70));
    console.log(`Course Completions This Month: ${studentCompletions}\n`);

    if (studentCompletions === 0 && allCompleted.length > 0) {
      console.log('⚠️  WARNING: There are completed courses but 0 student completions!');
      console.log('   This means all completions are by instructors/admins.\n');
      console.log('   Instructors who completed courses:');
      const instructorCompletions = allCompleted.filter(p => p.student?.role !== 'student');
      instructorCompletions.forEach((prog, i) => {
        console.log(`   ${i + 1}. ${prog.student?.name} (${prog.student?.role}) - ${prog.course?.title}`);
      });
      console.log('\n   These do NOT count in analytics (correct behavior).\n');
    }

    // Check if there are students WITH progress but not completed
    const studentProgressNotComplete = await Progress.find({
      student: { $in: studentIds },
      isCompleted: { $ne: true }
    })
    .populate('student', 'name')
    .populate('course', 'title')
    .sort({ overallProgress: -1 })
    .limit(5);

    if (studentProgressNotComplete.length > 0) {
      console.log('📚 STUDENTS IN PROGRESS (NOT YET COMPLETED):');
      console.log('═'.repeat(70));
      studentProgressNotComplete.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student?.name} - ${prog.course?.title}`);
        console.log(`   Progress: ${prog.overallProgress || 0}%`);
        console.log(`   Completed: ${prog.isCompleted ? 'Yes' : 'No'}\n`);
      });
    }

    // Summary
    console.log('📋 SUMMARY:');
    console.log('═'.repeat(70));
    console.log(`Total Completed Courses (all roles): ${allCompleted.length}`);
    console.log(`Students in Database: ${students.length}`);
    console.log(`Student Completions This Month: ${studentCompletions}`);
    console.log(`\nThis (${studentCompletions}) should appear in admin analytics!`);

    if (studentCompletions === 0) {
      console.log('\n💡 TO FIX THIS:');
      console.log('   1. Have a STUDENT (role="student") complete a course');
      console.log('   2. Use: POST /api/courses/:id/complete endpoint');
      console.log('   3. Or run: node test-scripts/create-test-completion.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

verifyAnalytics();

