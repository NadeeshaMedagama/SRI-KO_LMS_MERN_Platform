/**
 * Test script to verify the real revenue calculation in admin stats
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

async function testRevenueCalculation() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Get all payments
    const allPayments = await Payment.find({}).select('status amount paymentDate user subscription');
    console.log(`📊 Total Payments in Database: ${allPayments.length}`);

    // Group by status
    const paymentsByStatus = {};
    let totalAmount = 0;
    let completedAmount = 0;

    allPayments.forEach(payment => {
      const status = payment.status;
      if (!paymentsByStatus[status]) {
        paymentsByStatus[status] = { count: 0, amount: 0 };
      }
      paymentsByStatus[status].count++;
      paymentsByStatus[status].amount += payment.amount;
      totalAmount += payment.amount;

      if (status === 'completed') {
        completedAmount += payment.amount;
      }
    });

    console.log('\n📈 Payments by Status:');
    Object.keys(paymentsByStatus).forEach(status => {
      console.log(`  ${status}: ${paymentsByStatus[status].count} payments, LKR ${paymentsByStatus[status].amount.toLocaleString()}`);
    });

    console.log(`\n💰 Total Amount (All Statuses): LKR ${totalAmount.toLocaleString()}`);
    console.log(`💰 Total Revenue (Completed Only): LKR ${completedAmount.toLocaleString()}`);

    // Test the aggregation query used in the API
    console.log('\n🔍 Testing API Aggregation Query...');
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

    const apiRevenue = completedPayments.length > 0 ? completedPayments[0].totalRevenue : 0;
    console.log(`✅ API will return: LKR ${apiRevenue.toLocaleString()}`);

    // Show recent completed payments
    const recentCompleted = await Payment.find({ status: 'completed' })
      .sort({ paymentDate: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('subscription', 'plan');

    if (recentCompleted.length > 0) {
      console.log('\n📋 Recent Completed Payments:');
      recentCompleted.forEach((payment, index) => {
        console.log(`  ${index + 1}. LKR ${payment.amount} - ${payment.user?.name || 'Unknown'} (${payment.subscription?.plan || 'N/A'}) - ${payment.paymentDate?.toLocaleDateString() || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  No completed payments found in the database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

testRevenueCalculation();

