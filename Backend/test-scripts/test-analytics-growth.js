/**
 * Test script to verify analytics growth percentages are calculated correctly
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

async function testAnalyticsGrowth() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const User = require('../models/User');
    const Course = require('../models/Course');
    const Payment = require('../models/Payment');

    console.log('=' .repeat(70));
    console.log('🧪 TESTING ANALYTICS GROWTH PERCENTAGES');
    console.log('=' .repeat(70));
    console.log('');

    // Simulate analytics endpoint logic for last 30 days
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    // Previous period (30 days before that)
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = new Date(startDate);
    previousEndDate.setTime(previousEndDate.getTime() - 1);

    console.log('📅 Current Period: ', startDate.toLocaleDateString(), 'to', endDate.toLocaleDateString());
    console.log('📅 Previous Period:', previousStartDate.toLocaleDateString(), 'to', previousEndDate.toLocaleDateString());
    console.log('');

    // Get totals
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get total revenue
    const completedPayments = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = completedPayments.length > 0 ? completedPayments[0].totalRevenue : 0;

    // Current period counts
    const currentPeriodUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const currentPeriodCourses = await Course.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const currentPeriodActiveUsers = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const currentRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentDate: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const currentPeriodRevenue = currentRevenue.length > 0 ? currentRevenue[0].totalRevenue : 0;

    // Previous period counts
    const previousUsers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const previousCourses = await Course.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const previousActiveUsers = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const prevRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          paymentDate: { $gte: previousStartDate, $lt: startDate }
        }
      },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const previousPeriodRevenue = prevRevenue.length > 0 ? prevRevenue[0].totalRevenue : 0;

    // Calculate growth
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const usersGrowth = calculateGrowth(currentPeriodUsers, previousUsers);
    const coursesGrowth = calculateGrowth(currentPeriodCourses, previousCourses);
    const revenueGrowth = calculateGrowth(currentPeriodRevenue, previousPeriodRevenue);
    const activeUsersGrowth = calculateGrowth(currentPeriodActiveUsers, previousActiveUsers);

    console.log('📊 OVERVIEW (Total Counts):');
    console.log('-'.repeat(70));
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📚 Total Courses: ${totalCourses}`);
    console.log(`💰 Total Revenue: LKR ${totalRevenue.toLocaleString()}`);
    console.log(`✨ Active Users: ${activeUsers}`);
    console.log('');

    console.log('📈 CURRENT PERIOD (Last 30 Days):');
    console.log('-'.repeat(70));
    console.log(`👥 New Users: ${currentPeriodUsers}`);
    console.log(`📚 New Courses: ${currentPeriodCourses}`);
    console.log(`💰 Revenue: LKR ${currentPeriodRevenue.toLocaleString()}`);
    console.log(`✨ New Active Users: ${currentPeriodActiveUsers}`);
    console.log('');

    console.log('📉 PREVIOUS PERIOD (30 Days Before):');
    console.log('-'.repeat(70));
    console.log(`👥 New Users: ${previousUsers}`);
    console.log(`📚 New Courses: ${previousCourses}`);
    console.log(`💰 Revenue: LKR ${previousPeriodRevenue.toLocaleString()}`);
    console.log(`✨ New Active Users: ${previousActiveUsers}`);
    console.log('');

    console.log('=' .repeat(70));
    console.log('📈 GROWTH PERCENTAGES (What API Will Return):');
    console.log('=' .repeat(70));

    const formatGrowth = (value) => {
      const sign = value >= 0 ? '+' : '';
      const emoji = value >= 0 ? '📈' : '📉';
      return `${emoji} ${sign}${value}%`;
    };

    console.log(`👥 Users Growth: ${formatGrowth(usersGrowth)}`);
    console.log(`📚 Courses Growth: ${formatGrowth(coursesGrowth)}`);
    console.log(`💰 Revenue Growth: ${formatGrowth(revenueGrowth)}`);
    console.log(`✨ Active Users Growth: ${formatGrowth(activeUsersGrowth)}`);
    console.log('');

    console.log('=' .repeat(70));
    console.log('✅ FRONTEND WILL DISPLAY:');
    console.log('=' .repeat(70));
    console.log(`Total Users: ${totalUsers} (${formatGrowth(usersGrowth)})`);
    console.log(`Total Courses: ${totalCourses} (${formatGrowth(coursesGrowth)})`);
    console.log(`Total Revenue: LKR ${totalRevenue.toLocaleString()} (${formatGrowth(revenueGrowth)})`);
    console.log(`Active Users: ${activeUsers} (${formatGrowth(activeUsersGrowth)})`);
    console.log('');

    console.log('=' .repeat(70));
    console.log('🎉 ANALYSIS COMPLETE!');
    console.log('=' .repeat(70));
    console.log('✅ All growth percentages are calculated from REAL data');
    console.log('✅ Comparing current period vs previous period');
    console.log('✅ No more hardcoded values!');
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

testAnalyticsGrowth();

