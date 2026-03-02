/**
 * Direct Analytics Calculation Test
 * This simulates the exact calculation that should happen in the backend
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

const testDirectCalculation = async () => {
  try {
    console.log('🧪 Testing Direct Analytics Calculation\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Simulate the exact logic from adminRoutes.js analytics endpoint
    const period = 30;
    const days = parseInt(period);

    // Calculate date range (last 30 days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    console.log(`📅 Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}\n`);

    // Get overview statistics (same as in the endpoint)
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Calculate total revenue from completed payments
    const completedPayments = await Payment.aggregate([
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

    const totalRevenue = completedPayments.length > 0 ? completedPayments[0].totalRevenue : 0;

    // Get new items added in the current period
    const newUsersInPeriod = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const newCoursesInPeriod = await Course.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const newActiveUsersInPeriod = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get revenue from current period
    const currentPeriodRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const revenueInPeriod = currentPeriodRevenue.length > 0 ? currentPeriodRevenue[0].totalRevenue : 0;

    // Calculate growth percentages as: (new items in period / total items) * 100
    const calculateGrowthPercentage = (newInPeriod, total) => {
      if (total === 0) return 0;
      return Number(((newInPeriod / total) * 100).toFixed(1));
    };

    const usersGrowth = calculateGrowthPercentage(newUsersInPeriod, totalUsers);
    const coursesGrowth = calculateGrowthPercentage(newCoursesInPeriod, totalCourses);
    const revenueGrowth = calculateGrowthPercentage(revenueInPeriod, totalRevenue);
    const activeUsersGrowth = calculateGrowthPercentage(newActiveUsersInPeriod, activeUsers);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ANALYTICS CALCULATION RESULTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📈 USERS:');
    console.log(`   Total: ${totalUsers}`);
    console.log(`   New (last ${days} days): ${newUsersInPeriod}`);
    console.log(`   Calculation: (${newUsersInPeriod} / ${totalUsers}) × 100`);
    console.log(`   Growth: ${usersGrowth}%`);
    console.log('');

    console.log('📚 COURSES:');
    console.log(`   Total: ${totalCourses}`);
    console.log(`   New (last ${days} days): ${newCoursesInPeriod}`);
    console.log(`   Calculation: (${newCoursesInPeriod} / ${totalCourses}) × 100`);
    console.log(`   Growth: ${coursesGrowth}%`);
    console.log('');

    console.log('💰 REVENUE:');
    console.log(`   Total: LKR ${totalRevenue.toFixed(2)}`);
    console.log(`   New (last ${days} days): LKR ${revenueInPeriod.toFixed(2)}`);
    console.log(`   Calculation: (${revenueInPeriod.toFixed(2)} / ${totalRevenue.toFixed(2)}) × 100`);
    console.log(`   Growth: ${revenueGrowth}%`);
    console.log('');

    console.log('🟢 ACTIVE USERS:');
    console.log(`   Total: ${activeUsers}`);
    console.log(`   New (last ${days} days): ${newActiveUsersInPeriod}`);
    console.log(`   Calculation: (${newActiveUsersInPeriod} / ${activeUsers}) × 100`);
    console.log(`   Growth: ${activeUsersGrowth}%`);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 EXPECTED API RESPONSE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const expectedResponse = {
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalCourses,
          totalRevenue,
          activeUsers,
          usersGrowth,
          coursesGrowth,
          revenueGrowth,
          activeUsersGrowth,
        }
      }
    };

    console.log(JSON.stringify(expectedResponse, null, 2));
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📺 WHAT SHOULD APPEAR ON FRONTEND');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`Total Users: ${totalUsers} (+${usersGrowth}%)`);
    console.log(`Total Courses: ${totalCourses} (+${coursesGrowth}%)`);
    console.log(`Total Revenue: LKR ${totalRevenue.toFixed(2)} (+${revenueGrowth}%)`);
    console.log(`Active Users: ${activeUsers} (+${activeUsersGrowth}%)`);
    console.log('');

    if (usersGrowth === 100 && coursesGrowth === 100 && revenueGrowth === 100) {
      console.log('⚠️  WARNING: All percentages are 100%!');
      console.log('   This means ALL data was created in the last 30 days.');
      console.log('   This is only correct if your system is brand new.');
      console.log('');
      console.log('   Based on earlier verification, this is WRONG!');
      console.log('   Your system has data older than 30 days.');
      console.log('   Expected values: ~9.5%, ~12.5%, ~0.0%');
    } else {
      console.log('✅ Percentages look correct based on date ranges!');
    }

    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

testDirectCalculation();

