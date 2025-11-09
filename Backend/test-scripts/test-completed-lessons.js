require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Progress = require('./models/Progress');
const User = require('./models/User');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');

    // Find a user with progress records
    const testUser = await User.findOne({ email: 'instructor1@example.com' });

    if (!testUser) {
      console.log('❌ Test user not found');
      await mongoose.connection.close();
      return;
    }

    console.log(`👤 Testing with user: ${testUser.name} (${testUser.email})`);
    console.log(`   Enrolled courses: ${testUser.enrolledCourses.length}\n`);

    // Get all progress records for this user
    const progressRecords = await Progress.find({ student: testUser._id })
      .populate('course', 'title curriculum');

    console.log(`📊 Progress records found: ${progressRecords.length}\n`);

    let totalCompletedLessons = 0;

    progressRecords.forEach((progress, idx) => {
      console.log(`\n📚 Progress #${idx + 1}: ${progress.course?.title || 'Unknown Course'}`);
      console.log(`   Course ID: ${progress.course?._id}`);
      console.log(`   Student ID: ${progress.student}`);

      // Check completedLessons array
      const completedLessonsArray = progress.completedLessons || [];
      console.log(`   Completed lessons array length: ${completedLessonsArray.length}`);
      console.log(`   Completed lessons type: ${typeof completedLessonsArray}`);
      console.log(`   Is array: ${Array.isArray(completedLessonsArray)}`);

      if (completedLessonsArray.length > 0) {
        console.log(`   First completed lesson:`);
        console.log(`     - Lesson ID: ${completedLessonsArray[0].lesson}`);
        console.log(`     - Completed at: ${completedLessonsArray[0].completedAt}`);
        console.log(`     - Score: ${completedLessonsArray[0].score}`);
      }

      // Calculate total lessons in course
      const course = progress.course;
      let totalLessons = 0;
      if (course && course.curriculum) {
        totalLessons = course.curriculum.reduce((total, week) => {
          return total + (week.lessons ? week.lessons.length : 0);
        }, 0);
      }

      console.log(`   Total lessons in course: ${totalLessons}`);
      console.log(`   Overall progress: ${progress.overallProgress}%`);
      console.log(`   Time spent: ${progress.timeSpent} minutes`);
      console.log(`   Is completed: ${progress.isCompleted}`);
      console.log(`   Current week: ${progress.currentWeek}`);

      totalCompletedLessons += completedLessonsArray.length;
    });

    console.log(`\n\n✅ TOTAL COMPLETED LESSONS ACROSS ALL COURSES: ${totalCompletedLessons}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

