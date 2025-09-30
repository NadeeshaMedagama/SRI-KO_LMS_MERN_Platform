const express = require('express');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { protect, authorize, checkCourseAccess } = require('../middleware/auth');
const {
  validateCourseCreation,
  validateReview,
  handleValidationErrors,
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get all courses (public)
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by level
    if (req.query.level) {
      filter.level = req.query.level;
    }

    // Filter by published status
    if (req.query.published) {
      filter.isPublished = req.query.published === 'true';
    }

    // Search by title
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar')
      .populate('enrolledStudents', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get course by ID (public)
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('enrolledStudents', 'name avatar')
      .populate({
        path: 'reviews.user',
        select: 'name avatar',
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Instructor/Admin
router.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  validateCourseCreation,
  handleValidationErrors,
  async (req, res) => {
    try {
      // Add instructor to course data
      const courseData = {
        ...req.body,
        instructor: req.user.id,
      };

      const course = await Course.create(courseData);

      // Populate the instructor field
      await course.populate('instructor', 'name avatar');

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor/Admin
router.put(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  checkCourseAccess,
  async (req, res) => {
    try {
      let course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if user is the instructor or admin
      if (
        course.instructor.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this course',
        });
      }

      course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('instructor', 'name avatar');

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
router.delete(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  checkCourseAccess,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if user is the instructor or admin
      if (
        course.instructor.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this course',
        });
      }

      await Course.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published yet',
      });
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      student: req.user.id,
      course: req.params.id,
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
    }

    // Add student to course
    course.enrolledStudents.push(req.user.id);
    await course.save();

    // Create progress record
    const progress = await Progress.create({
      student: req.user.id,
      course: req.params.id,
      currentWeek: 1,
      overallProgress: 0,
    });

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Enrolled in course successfully',
      course: {
        id: course._id,
        title: course.title,
        progress: progress.overallProgress,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get enrolled courses for user
// @route   GET /api/courses/my-courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'instructor',
        select: 'name avatar',
      },
    });

    res.status(200).json({
      success: true,
      courses: user.enrolledCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
router.post(
  '/:id/reviews',
  protect,
  authorize('student', 'instructor', 'admin'),
  validateReview,
  handleValidationErrors,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if user has already reviewed this course
      const existingReview = course.reviews.find(
        review => review.user.toString() === req.user.id.toString()
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this course',
        });
      }

      const review = {
        user: req.user.id,
        rating: req.body.rating,
        comment: req.body.comment,
      };

      course.reviews.push(review);

      // Recalculate average rating
      const totalRating = course.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      course.averageRating = totalRating / course.reviews.length;

      await course.save();

      await course.populate({
        path: 'reviews.user',
        select: 'name avatar',
      });

      res.status(200).json({
        success: true,
        message: 'Review added successfully',
        course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

module.exports = router;
