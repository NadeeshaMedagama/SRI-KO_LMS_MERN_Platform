/**
 * Test script to verify analytics percentage calculations
 * This tests that the growth percentages are calculated as:
 * (new items in period / total items) * 100
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? '../config.production.env'
  : '../config.env';
require('dotenv').config({ path: path.join(__dirname, envFile) });

const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

const testAnalyticsPercentage = async () => {
  try {
    console.log('🧪 Testing Analytics Percentage Calculation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get current date
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('📅 Date Range: Last 30 days');
    console.log('   From:', thirtyDaysAgo.toISOString());
    console.log('   To:', now.toISOString());
    console.log('');

    // Test Users
    console.log('👥 USERS ANALYSIS:');
    const totalUsers = await User.countDocuments();
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });
    const expectedUsersPercentage = totalUsers > 0
      ? Number(((newUsersLast30Days / totalUsers) * 100).toFixed(1))
      : 0;

    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   New Users (Last 30 days): ${newUsersLast30Days}`);
    console.log(`   Expected Percentage: ${expectedUsersPercentage}%`);
    console.log(`   Formula: (${newUsersLast30Days} / ${totalUsers}) × 100 = ${expectedUsersPercentage}%`);
    console.log('');

    // Test Courses
    console.log('📚 COURSES ANALYSIS:');
    const totalCourses = await Course.countDocuments();
    const newCoursesLast30Days = await Course.countDocuments({
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });
    const expectedCoursesPercentage = totalCourses > 0
      ? Number(((newCoursesLast30Days / totalCourses) * 100).toFixed(1))
      : 0;

    console.log(`   Total Courses: ${totalCourses}`);
    console.log(`   New Courses (Last 30 days): ${newCoursesLast30Days}`);
    console.log(`   Expected Percentage: ${expectedCoursesPercentage}%`);
    console.log(`   Formula: (${newCoursesLast30Days} / ${totalCourses}) × 100 = ${expectedCoursesPercentage}%`);
    console.log('');

    // Test Revenue
    console.log('💰 REVENUE ANALYSIS:');
    const totalRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

    const revenueLast30DaysResult = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentDate: { $gte: thirtyDaysAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const revenueLast30Days = revenueLast30DaysResult.length > 0
      ? revenueLast30DaysResult[0].totalRevenue
      : 0;

    const expectedRevenuePercentage = totalRevenue > 0
      ? Number(((revenueLast30Days / totalRevenue) * 100).toFixed(1))
      : 0;

    console.log(`   Total Revenue: LKR ${totalRevenue.toFixed(2)}`);
    console.log(`   Revenue (Last 30 days): LKR ${revenueLast30Days.toFixed(2)}`);
    console.log(`   Expected Percentage: ${expectedRevenuePercentage}%`);
    console.log(`   Formula: (${revenueLast30Days.toFixed(2)} / ${totalRevenue.toFixed(2)}) × 100 = ${expectedRevenuePercentage}%`);
    console.log('');

    // Test Active Users
    console.log('🟢 ACTIVE USERS ANALYSIS:');
    const totalActiveUsers = await User.countDocuments({ isActive: true });
    const newActiveUsersLast30Days = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });
    const expectedActiveUsersPercentage = totalActiveUsers > 0
      ? Number(((newActiveUsersLast30Days / totalActiveUsers) * 100).toFixed(1))
      : 0;

    console.log(`   Total Active Users: ${totalActiveUsers}`);
    console.log(`   New Active Users (Last 30 days): ${newActiveUsersLast30Days}`);
    console.log(`   Expected Percentage: ${expectedActiveUsersPercentage}%`);
    console.log(`   Formula: (${newActiveUsersLast30Days} / ${totalActiveUsers}) × 100 = ${expectedActiveUsersPercentage}%`);
    console.log('');

    console.log('✅ Test Complete!');
    console.log('');
    console.log('📊 SUMMARY:');
    console.log('   These percentages should appear in your admin dashboard and analytics page.');
    console.log('   They represent what portion of the total came from the last 30 days.');
    console.log('');

    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

testAnalyticsPercentage();

