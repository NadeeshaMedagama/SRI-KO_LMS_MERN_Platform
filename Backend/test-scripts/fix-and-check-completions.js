#!/usr/bin/env node

/**
 * Complete Course Completion Fix & Diagnostics
 * - Fixes missing completionDate fields
 * - Shows what analytics will display
 */

const mongoose = require('mongoose');

// Simple schema definitions to avoid module loading issues
const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.ObjectId, ref: 'User' },
  course: { type: mongoose.Schema.ObjectId, ref: 'Course' },
  isCompleted: Boolean,
  completionDate: Date,
  overallProgress: Number,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const Progress = mongoose.model('Progress', progressSchema);

async function main() {
  try {
    console.log('🔍 Course Completion Diagnostics & Fix\n');

    // Connect
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check all completed courses
    console.log('📊 STEP 1: Checking Completed Courses');
    console.log('═'.repeat(60));
    const allCompleted = await Progress.find({ isCompleted: true });
    console.log(`Total completed courses: ${allCompleted.length}\n`);

    // 2. Find courses without completionDate
    const withoutDate = allCompleted.filter(p => !p.completionDate);
    console.log(`Without completionDate: ${withoutDate.length}`);

    if (withoutDate.length > 0) {
      console.log('\n🔧 STEP 2: Fixing Missing Completion Dates');
      console.log('═'.repeat(60));

      for (const prog of withoutDate) {
        // Set to updatedAt or createdAt or now
        prog.completionDate = prog.updatedAt || prog.createdAt || new Date();
        await prog.save();
        console.log(`✅ Fixed course ${prog.course} - set to ${prog.completionDate.toLocaleDateString()}`);
      }
      console.log(`\n✅ Fixed ${withoutDate.length} record(s)\n`);
    } else {
      console.log('✅ All completed courses have completionDate\n');
    }

    // 3. Calculate this month's stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('📅 STEP 3: This Month\'s Completions');
    console.log('═'.repeat(60));
    console.log(`Period: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}\n`);

    const thisMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`Completions this month: ${thisMonth}`);

    // 4. Calculate last month's stats
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart.getTime() - 1);

    const lastMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });

    console.log(`Completions last month: ${lastMonth}\n`);

    // 5. Calculate growth
    let growth = 0;
    if (lastMonth === 0) {
      growth = thisMonth > 0 ? 100 : 0;
    } else {
      growth = Number((((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1));
    }

    console.log('📈 STEP 4: Analytics Preview');
    console.log('═'.repeat(60));
    console.log(`Course Completions: ${thisMonth}`);
    console.log(`Growth: ${growth > 0 ? '+' : ''}${growth}%`);
    console.log('\nThis is what will appear in your admin analytics!\n');

    // 6. List this month's completions
    if (thisMonth > 0) {
      console.log('📋 STEP 5: Details of This Month\'s Completions');
      console.log('═'.repeat(60));

      const details = await Progress.find({
        isCompleted: true,
        completionDate: { $gte: monthStart, $lte: monthEnd }
      }).sort({ completionDate: -1 });

      details.forEach((p, i) => {
        console.log(`${i + 1}. Completed: ${p.completionDate.toLocaleDateString()}`);
        console.log(`   Course ID: ${p.course}`);
        console.log(`   Student ID: ${p.student}`);
        console.log(`   Progress: ${p.overallProgress}%\n`);
      });
    }

    console.log('✅ Done! Refresh your analytics page to see the updated values.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

main();

