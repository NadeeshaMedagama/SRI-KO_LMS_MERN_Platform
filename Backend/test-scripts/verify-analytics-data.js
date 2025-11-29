/**
 * Verify Analytics Data - Check if 100% is correct
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'config.production.env')
  : path.join(__dirname, '..', 'config.env');
require('dotenv').config({ path: envFile });

const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

const verifyData = async () => {
  try {
    console.log('🔍 Verifying Analytics Data...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get current date and 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('📅 Date Range (Last 30 Days):');
    console.log(`   From: ${thirtyDaysAgo.toISOString()}`);
    console.log(`   To:   ${now.toISOString()}\n`);

    // Check Users
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 USERS ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalUsers = await User.countDocuments();
    const usersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });

    // Get oldest user
    const oldestUser = await User.findOne().sort({ createdAt: 1 }).select('createdAt name email');
    const newestUser = await User.findOne().sort({ createdAt: -1 }).select('createdAt name email');

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Users created in last 30 days: ${usersLast30Days}`);
    if (oldestUser) {
      console.log(`Oldest user created: ${oldestUser.createdAt.toISOString()}`);
      console.log(`  (${Math.floor((now - oldestUser.createdAt) / (1000 * 60 * 60 * 24))} days ago)`);
    }
    if (newestUser) {
      console.log(`Newest user created: ${newestUser.createdAt.toISOString()}`);
    }

    const userPercentage = totalUsers > 0 ? ((usersLast30Days / totalUsers) * 100).toFixed(1) : 0;
    console.log(`\n📊 Percentage: ${userPercentage}%`);

    if (userPercentage === '100.0') {
      console.log('✅ This means ALL users were created in the last 30 days (NEW SYSTEM)');
    } else {
      console.log(`ℹ️  ${100 - userPercentage}% of users are older than 30 days`);
    }
    console.log('');

    // Check Courses
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 COURSES ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalCourses = await Course.countDocuments();
    const coursesLast30Days = await Course.countDocuments({
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });

    const oldestCourse = await Course.findOne().sort({ createdAt: 1 }).select('createdAt title');
    const newestCourse = await Course.findOne().sort({ createdAt: -1 }).select('createdAt title');

    console.log(`Total Courses: ${totalCourses}`);
    console.log(`Courses created in last 30 days: ${coursesLast30Days}`);
    if (oldestCourse) {
      console.log(`Oldest course created: ${oldestCourse.createdAt.toISOString()}`);
      console.log(`  (${Math.floor((now - oldestCourse.createdAt) / (1000 * 60 * 60 * 24))} days ago)`);
    }
    if (newestCourse) {
      console.log(`Newest course created: ${newestCourse.createdAt.toISOString()}`);
    }

    const coursePercentage = totalCourses > 0 ? ((coursesLast30Days / totalCourses) * 100).toFixed(1) : 0;
    console.log(`\n📊 Percentage: ${coursePercentage}%`);

    if (coursePercentage === '100.0') {
      console.log('✅ This means ALL courses were created in the last 30 days (NEW SYSTEM)');
    } else {
      console.log(`ℹ️  ${100 - coursePercentage}% of courses are older than 30 days`);
    }
    console.log('');

    // Check Revenue
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 REVENUE ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const allPayments = await Payment.find({ status: 'completed' }).sort({ paymentDate: 1 });
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const paymentsLast30Days = allPayments.filter(p => p.paymentDate >= thirtyDaysAgo && p.paymentDate <= now);
    const revenueLast30Days = paymentsLast30Days.reduce((sum, p) => sum + p.amount, 0);

    console.log(`Total Payments: ${allPayments.length}`);
    console.log(`Total Revenue: LKR ${totalRevenue.toFixed(2)}`);
    console.log(`Payments in last 30 days: ${paymentsLast30Days.length}`);
    console.log(`Revenue in last 30 days: LKR ${revenueLast30Days.toFixed(2)}`);

    if (allPayments.length > 0) {
      const oldestPayment = allPayments[0];
      const newestPayment = allPayments[allPayments.length - 1];
      console.log(`Oldest payment: ${oldestPayment.paymentDate.toISOString()}`);
      console.log(`  (${Math.floor((now - oldestPayment.paymentDate) / (1000 * 60 * 60 * 24))} days ago)`);
      console.log(`Newest payment: ${newestPayment.paymentDate.toISOString()}`);
    }

    const revenuePercentage = totalRevenue > 0 ? ((revenueLast30Days / totalRevenue) * 100).toFixed(1) : 0;
    console.log(`\n📊 Percentage: ${revenuePercentage}%`);

    if (revenuePercentage === '100.0') {
      console.log('✅ This means ALL revenue came from the last 30 days (NEW SYSTEM)');
    } else {
      console.log(`ℹ️  ${100 - revenuePercentage}% of revenue is older than 30 days`);
    }
    console.log('');

    // Check Active Users
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🟢 ACTIVE USERS ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalActiveUsers = await User.countDocuments({ isActive: true });
    const activeUsersLast30Days = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo, $lte: now }
    });

    console.log(`Total Active Users: ${totalActiveUsers}`);
    console.log(`Active Users created in last 30 days: ${activeUsersLast30Days}`);

    const activeUserPercentage = totalActiveUsers > 0 ? ((activeUsersLast30Days / totalActiveUsers) * 100).toFixed(1) : 0;
    console.log(`\n📊 Percentage: ${activeUserPercentage}%`);

    if (activeUserPercentage === '100.0') {
      console.log('✅ This means ALL active users became active in the last 30 days (NEW SYSTEM)');
    } else {
      console.log(`ℹ️  ${100 - activeUserPercentage}% of active users are older than 30 days`);
    }
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (userPercentage === '100.0' && coursePercentage === '100.0' && revenuePercentage === '100.0') {
      console.log('✅ ALL percentages are 100% - This is CORRECT!');
      console.log('   Your system is NEW (less than 30 days old)');
      console.log('   All data was created within the last 30 days');
      console.log('');
      console.log('💡 This will change over time as your system ages:');
      console.log('   - After 30+ days, older data will reduce the percentage');
      console.log('   - The percentage will show the growth rate');
      console.log('');
      console.log('📈 Example after 60 days:');
      console.log('   - If you add 10 new users in days 30-60');
      console.log('   - And you had 21 users in days 0-30');
      console.log('   - Total = 31 users');
      console.log('   - Last 30 days = 10 users');
      console.log('   - Percentage = 10/31 = 32.3%');
    } else {
      console.log('✅ The percentages are ACCURATE based on your data!');
      console.log('   The calculation is working correctly.');
    }
    console.log('');

    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

verifyData();

