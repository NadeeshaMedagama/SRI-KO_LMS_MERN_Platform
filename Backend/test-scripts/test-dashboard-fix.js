require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Progress = require('./models/Progress');

async function testDashboardCalculation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a user with completed courses
    const testUser = await User.findOne({ email: 'instructor1@example.com' });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 Testing with user: ${testUser.name} (${testUser.email})\n`);

    // Get progress data
    const progressDataRaw = await Progress.find({ student: testUser._id })
      .sort({ lastAccessed: -1 })
      .lean();

    console.log(`📊 Progress records found: ${progressDataRaw.length}\n`);

    // Get course IDs from progress
    const progressCourseIds = progressDataRaw.map(p => p.course).filter(Boolean);

    // Fetch courses
    const progressCourses = await Course.find({ _id: { $in: progressCourseIds } })
      .select('_id title curriculum')
      .lean();

    // Create course map
    const courseMap = new Map(progressCourses.map(c => [c._id.toString(), c]));

    // Combine progress with course data
    const validProgressData = progressDataRaw
      .map(p => {
        const courseData = courseMap.get(p.course?.toString());
        if (!courseData) return null;
        return { ...p, course: courseData };
      })
      .filter(p => p != null);

    console.log(`📊 Valid progress records: ${validProgressData.length}\n`);

    // Calculate total completed lessons using the NEW logic
    let totalCompletedLessons = 0;

    for (const progress of validProgressData) {
      let lessonCount = 0;

      console.log(`\n📚 Course: ${progress.course?.title || 'Unknown'}`);
      console.log(`   isCompleted: ${progress.isCompleted}`);
      console.log(`   overallProgress: ${progress.overallProgress}%`);
      console.log(`   completedLessons array length: ${progress.completedLessons?.length || 0}`);

      if (progress.completedLessons && Array.isArray(progress.completedLessons) && progress.completedLessons.length > 0) {
        // If completedLessons array has items, use that count
        lessonCount = progress.completedLessons.length;
        console.log(`   ✅ Using completedLessons array: ${lessonCount} lessons`);
      } else if (progress.isCompleted) {
        // If course is marked as completed, count all lessons
        const courseId = progress.course._id || progress.course;
        const fullCourse = await Course.findById(courseId).select('curriculum');
        if (fullCourse && fullCourse.curriculum) {
          lessonCount = fullCourse.curriculum.reduce((sum, week) => {
            return sum + (week.lessons ? week.lessons.length : 0);
          }, 0);
          console.log(`   ✅ Course is completed - counting all lessons: ${lessonCount} lessons`);
        }
      } else if (progress.overallProgress === 100) {
        // If overallProgress is 100%
        const courseId = progress.course._id || progress.course;
        const fullCourse = await Course.findById(courseId).select('curriculum');
        if (fullCourse && fullCourse.curriculum) {
          lessonCount = fullCourse.curriculum.reduce((sum, week) => {
            return sum + (week.lessons ? week.lessons.length : 0);
          }, 0);
          console.log(`   ✅ Progress is 100% - counting all lessons: ${lessonCount} lessons`);
        }
      } else {
        console.log(`   ⏳ Course in progress: 0 lessons counted`);
      }

      totalCompletedLessons += lessonCount;
    }

    console.log(`\n\n🎯 FINAL RESULT:`);
    console.log(`   Total Enrolled Courses: ${testUser.enrolledCourses.length}`);
    console.log(`   Total Completed Lessons: ${totalCompletedLessons}`);
    console.log(`   Completed Courses: ${validProgressData.filter(p => p.isCompleted).length}`);

    await mongoose.connection.close();
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDashboardCalculation();

