#!/usr/bin/env node

/**
 * Test User Activity Metrics
 * Verifies the calculations for Daily Active Users, Course Completions, and Average Rating
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

console.log('🧪 Testing User Activity Metrics Calculations\n');

async function testUserActivityMetrics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Daily Active Users
    console.log('📊 TEST 1: Daily Active Users');
    console.log('─'.repeat(50));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyActiveUsers = await User.countDocuments({
      lastLogin: { $gte: today, $lt: tomorrow }
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayActiveUsers = await User.countDocuments({
      lastLogin: { $gte: yesterday, $lt: today }
    });

    const dailyGrowth = yesterdayActiveUsers === 0
      ? (dailyActiveUsers > 0 ? 100 : 0)
      : Number((((dailyActiveUsers - yesterdayActiveUsers) / yesterdayActiveUsers) * 100).toFixed(1));

    console.log(`Today (${today.toDateString()}):`);
    console.log(`  Active Users: ${dailyActiveUsers}`);
    console.log(`Yesterday (${yesterday.toDateString()}):`);
    console.log(`  Active Users: ${yesterdayActiveUsers}`);
    console.log(`Growth: ${dailyGrowth > 0 ? '+' : ''}${dailyGrowth}%`);
    console.log('');

    // Test 2: Course Completions This Month
    console.log('📊 TEST 2: Course Completions This Month');
    console.log('─'.repeat(50));

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const courseCompletionsThisMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setTime(prevMonthEnd.getTime() - 1);

    const courseCompletionsPrevMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    const completionsGrowth = courseCompletionsPrevMonth === 0
      ? (courseCompletionsThisMonth > 0 ? 100 : 0)
      : Number((((courseCompletionsThisMonth - courseCompletionsPrevMonth) / courseCompletionsPrevMonth) * 100).toFixed(1));

    console.log(`This Month (${monthStart.toDateString()} - ${monthEnd.toDateString()}):`);
    console.log(`  Completed Courses: ${courseCompletionsThisMonth}`);
    console.log(`Previous Month (${prevMonthStart.toDateString()} - ${prevMonthEnd.toDateString()}):`);
    console.log(`  Completed Courses: ${courseCompletionsPrevMonth}`);
    console.log(`Growth: ${completionsGrowth > 0 ? '+' : ''}${completionsGrowth}%`);
    console.log('');

    // Test 3: Average Rating
    console.log('📊 TEST 3: Average Course Rating');
    console.log('─'.repeat(50));

    const ratingStats = await Course.aggregate([
      {
        $match: {
          isPublished: true,
          averageRating: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$averageRating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (ratingStats.length > 0) {
      const currentAvgRating = ratingStats[0].averageRating;
      const ratedCoursesCount = ratingStats[0].count;

      console.log(`Published Courses with Ratings: ${ratedCoursesCount}`);
      console.log(`Average Rating: ${currentAvgRating.toFixed(2)} / 5.00`);
      console.log(`Stars: ${'★'.repeat(Math.round(currentAvgRating))}${'☆'.repeat(5 - Math.round(currentAvgRating))}`);

      // Show rating distribution
      const ratingDistribution = await Course.aggregate([
        {
          $match: {
            isPublished: true,
            averageRating: { $gt: 0 }
          }
        },
        {
          $bucket: {
            groupBy: '$averageRating',
            boundaries: [0, 1, 2, 3, 4, 5, 6],
            default: 'Other',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]);

      console.log('\nRating Distribution:');
      ratingDistribution.forEach(bucket => {
        const stars = bucket._id === 'Other' ? 'Other' : `${bucket._id}-${bucket._id + 1}`;
        const bar = '█'.repeat(bucket.count);
        console.log(`  ${stars} stars: ${bar} (${bucket.count})`);
      });
    } else {
      console.log('No courses with ratings found.');
    }

    console.log('');

    // Summary
    console.log('═'.repeat(50));
    console.log('✅ USER ACTIVITY METRICS SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Daily Active Users: ${dailyActiveUsers} (${dailyGrowth > 0 ? '+' : ''}${dailyGrowth}%)`);
    console.log(`Course Completions: ${courseCompletionsThisMonth} (${completionsGrowth > 0 ? '+' : ''}${completionsGrowth}%)`);
    console.log(`Average Rating: ${ratingStats.length > 0 ? ratingStats[0].averageRating.toFixed(1) : 'N/A'}`);
    console.log('');

    console.log('💡 These are the REAL values that will appear in the admin analytics page!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

testUserActivityMetrics();

