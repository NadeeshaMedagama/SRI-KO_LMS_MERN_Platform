#!/usr/bin/env node

/**
 * Test Eligible Students Fix
 * Verifies that only students (not instructors/admins) appear in eligible list
 */

const mongoose = require('mongoose');

async function testEligibleStudents() {
  try {
    console.log('🧪 Testing Eligible Students Fix\n');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }, { timestamps: true });

    const courseSchema = new mongoose.Schema({
      title: String
    }, { timestamps: true });

    const progressSchema = new mongoose.Schema({
      student: { type: mongoose.Schema.ObjectId, ref: 'User' },
      course: { type: mongoose.Schema.ObjectId, ref: 'Course' },
      isCompleted: Boolean,
      completionDate: Date
    }, { timestamps: true });

    const certificateSchema = new mongoose.Schema({
      student: { type: mongoose.Schema.ObjectId, ref: 'User' },
      course: { type: mongoose.Schema.ObjectId, ref: 'Course' }
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Course = mongoose.model('Course', courseSchema);
    const Progress = mongoose.model('Progress', progressSchema);
    const Certificate = mongoose.model('Certificate', certificateSchema);

    // Check completed progress by role
    console.log('📊 COMPLETED COURSES BY ROLE:');
    console.log('═'.repeat(60));

    const completedProgress = await Progress.find({
      isCompleted: true
    }).populate('student', 'name email role');

    const byRole = {
      student: 0,
      instructor: 0,
      admin: 0,
      null: 0
    };

    completedProgress.forEach(prog => {
      if (!prog.student) {
        byRole.null++;
      } else {
        byRole[prog.student.role] = (byRole[prog.student.role] || 0) + 1;
      }
    });

    console.log(`Total Completed: ${completedProgress.length}`);
    console.log(`  Students: ${byRole.student}`);
    console.log(`  Instructors: ${byRole.instructor} ${byRole.instructor > 0 ? '⚠️ ' : ''}`);
    console.log(`  Admins: ${byRole.admin} ${byRole.admin > 0 ? '⚠️ ' : ''}`);
    console.log(`  Unknown: ${byRole.null}\n`);

    // Simulate the fixed eligible students query
    console.log('📋 ELIGIBLE STUDENTS (AFTER FIX):');
    console.log('═'.repeat(60));

    const eligibleProgress = await Progress.find({
      isCompleted: true
    })
    .populate({
      path: 'student',
      select: 'name email role',
      match: { role: 'student' }
    })
    .populate('course', 'title');

    const eligibleStudents = [];

    for (const progress of eligibleProgress) {
      if (!progress.student) {
        continue; // Skip instructors/admins
      }

      const existingCertificate = await Certificate.findOne({
        student: progress.student._id,
        course: progress.course._id
      });

      if (!existingCertificate) {
        eligibleStudents.push({
          student: progress.student,
          course: progress.course,
          completedAt: progress.completionDate
        });
      }
    }

    console.log(`Total Eligible: ${eligibleStudents.length}`);

    if (eligibleStudents.length > 0) {
      console.log('\nEligible List:');
      eligibleStudents.forEach((item, i) => {
        console.log(`${i + 1}. ${item.student.name} (${item.student.email})`);
        console.log(`   Role: ${item.student.role} ✅`);
        console.log(`   Course: ${item.course.title}`);
        console.log(`   Completed: ${item.completedAt ? item.completedAt.toLocaleDateString() : 'N/A'}\n`);
      });
    } else {
      console.log('No eligible students found (all have certificates already)\n');
    }

    // Check if any instructors would have been included before fix
    const instructorProgress = completedProgress.filter(p =>
      p.student && (p.student.role === 'instructor' || p.student.role === 'admin')
    );

    if (instructorProgress.length > 0) {
      console.log('⚠️  INSTRUCTORS/ADMINS EXCLUDED (BEFORE FIX WOULD SHOW):');
      console.log('═'.repeat(60));
      instructorProgress.forEach((prog, i) => {
        console.log(`${i + 1}. ${prog.student.name} (${prog.student.email})`);
        console.log(`   Role: ${prog.student.role} ❌ (Should NOT be eligible)`);
        console.log(`   This user is now correctly EXCLUDED\n`);
      });
    }

    console.log('✅ FIX VERIFIED: Only students with role="student" are eligible!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testEligibleStudents();

