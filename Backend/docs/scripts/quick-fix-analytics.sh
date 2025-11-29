#!/bin/bash

# Quick Fix Script for Analytics Course Completions
# This script fixes missing completionDate fields in Progress records

echo "🔧 Analytics Course Completions Quick Fix"
echo "=========================================="
echo ""

# Check if we're in the Backend directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the Backend directory"
    exit 1
fi

echo "📋 Step 1: Checking for missing completionDate fields..."
echo ""

# Run the fix script
node << 'EOF'
const mongoose = require('mongoose');
const path = require('path');

const envFile = process.env.NODE_ENV === 'production'
  ? './config.production.env'
  : process.env.NODE_ENV === 'test'
    ? './config.test.env'
    : './config.env';

require('dotenv').config({ path: envFile });

async function quickFix() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment');
      console.error('   Please ensure config.env exists and contains MONGO_URI');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    const Progress = require('./models/Progress');

    // Find completed courses without completionDate
    const toFix = await Progress.find({
      isCompleted: true,
      $or: [
        { completionDate: null },
        { completionDate: { $exists: false } }
      ]
    });

    if (toFix.length === 0) {
      console.log('✅ All completed courses have completionDate set!');
      console.log('   No fixes needed.');
    } else {
      console.log(`⚠️  Found ${toFix.length} completed course(s) without completionDate`);
      console.log('');
      console.log('🔧 Fixing records...');

      let fixed = 0;
      for (const prog of toFix) {
        prog.completionDate = prog.updatedAt;
        await prog.save();
        fixed++;
        console.log(`   ✅ Fixed record ${fixed}/${toFix.length}`);
      }

      console.log('');
      console.log(`✅ Fixed ${fixed} record(s)`);
    }

    // Show current month's completions
    console.log('');
    console.log('📊 Current Month Analytics:');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonth = await Progress.countDocuments({
      isCompleted: true,
      completionDate: { $gte: monthStart, $lte: monthEnd }
    });

    console.log(`   Completions this month: ${thisMonth}`);
    console.log(`   Month: ${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`);

    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Disconnected from MongoDB');
    console.log('');
    console.log('✅ Fix complete! Please restart your server.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

quickFix();
EOF

echo ""
echo "=========================================="
echo "Next steps:"
echo "1. Restart your server: npm start"
echo "2. Check analytics page in browser"
echo "=========================================="

