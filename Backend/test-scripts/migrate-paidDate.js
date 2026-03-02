/**
 * Migration Script: Backfill paidDate for existing completed payments
 *
 * Problem: Revenue queries now use `paidDate` instead of `paymentDate` to correctly
 * reflect when payments were actually completed. However, existing completed payments
 * may have `paidDate` as null (they were completed before the fix was applied).
 *
 * Solution: For all completed payments where `paidDate` is null, set `paidDate` to
 * `paymentDate` as the best available approximation.
 *
 * Usage: node test-scripts/migrate-paidDate.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables the same way the server does
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const Payment = require('../models/Payment');

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ No MongoDB URI found in environment variables');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all completed payments where paidDate is null
    const paymentsToFix = await Payment.find({
      status: 'completed',
      $or: [
        { paidDate: null },
        { paidDate: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${paymentsToFix.length} completed payments with missing paidDate`);

    if (paymentsToFix.length === 0) {
      console.log('✅ No payments need fixing. All completed payments already have paidDate set.');
      await mongoose.disconnect();
      return;
    }

    let fixed = 0;
    for (const payment of paymentsToFix) {
      // Use paymentDate as the best approximation for paidDate
      payment.paidDate = payment.paymentDate;
      await payment.save();
      fixed++;
      console.log(`  ✅ Fixed payment ${payment._id} - set paidDate to ${payment.paymentDate}`);
    }

    console.log(`\n🎉 Migration complete! Fixed ${fixed} out of ${paymentsToFix.length} payments.`);

    // Verify the fix
    const remainingBroken = await Payment.countDocuments({
      status: 'completed',
      $or: [
        { paidDate: null },
        { paidDate: { $exists: false } }
      ]
    });

    if (remainingBroken === 0) {
      console.log('✅ Verification passed: All completed payments now have paidDate set.');
    } else {
      console.warn(`⚠️ Warning: ${remainingBroken} completed payments still have missing paidDate.`);
    }

    // Show revenue summary after fix
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
          earliestPaidDate: { $min: '$paidDate' },
          latestPaidDate: { $max: '$paidDate' },
        }
      }
    ]);

    if (revenueStats.length > 0) {
      const stats = revenueStats[0];
      console.log('\n📊 Revenue Summary After Migration:');
      console.log(`   Total Revenue: LKR ${stats.totalRevenue.toLocaleString()}`);
      console.log(`   Completed Payments: ${stats.count}`);
      console.log(`   Earliest paidDate: ${stats.earliestPaidDate}`);
      console.log(`   Latest paidDate: ${stats.latestPaidDate}`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrate();


