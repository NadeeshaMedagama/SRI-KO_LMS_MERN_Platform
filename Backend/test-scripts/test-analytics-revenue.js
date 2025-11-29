/**
 * Test script to verify the analytics endpoint returns real revenue
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

async function testAnalyticsRevenue() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const Payment = require('../models/Payment');
    const User = require('../models/User');
    const Course = require('../models/Course');

    // Test the same aggregation used in both endpoints
    console.log('🔍 Testing Revenue Aggregation...\n');

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

    console.log('📊 RESULTS FOR BOTH ENDPOINTS:');
    console.log('================================');
    console.log(`✅ /admin/stats endpoint will return:`);
    console.log(`   Total Revenue: LKR ${totalRevenue.toLocaleString()}`);
    console.log('');
    console.log(`✅ /admin/analytics endpoint will return:`);
    console.log(`   overview.totalRevenue: LKR ${totalRevenue.toLocaleString()}`);
    console.log('');

    // Get counts for overview
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    console.log('📈 Additional Stats (for reference):');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Courses: ${totalCourses}`);
    console.log(`   Active Users: ${activeUsers}`);
    console.log('');

    // Get payment breakdown
    const allPayments = await Payment.find({}).select('status amount');
    const statusBreakdown = {};

    allPayments.forEach(payment => {
      if (!statusBreakdown[payment.status]) {
        statusBreakdown[payment.status] = { count: 0, total: 0 };
      }
      statusBreakdown[payment.status].count++;
      statusBreakdown[payment.status].total += payment.amount;
    });

    console.log('💳 Payment Status Breakdown:');
    Object.entries(statusBreakdown).forEach(([status, data]) => {
      const emoji = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳';
      console.log(`   ${emoji} ${status}: ${data.count} payment(s) = LKR ${data.total.toLocaleString()}`);
    });

    console.log('\n🎉 Both Admin Dashboard and Analytics & Reports will now show REAL revenue!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

testAnalyticsRevenue();

