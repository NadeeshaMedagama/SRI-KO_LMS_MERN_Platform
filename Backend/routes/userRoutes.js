const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');
const {
  validateProfileUpdate,
  handleValidationErrors,
} = require('../middleware/validation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// @desc    Get all users (Admin only) - Root route for /api/users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with enrolled courses
    const user = await User.findById(userId).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'instructor',
        select: 'name email avatar'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get progress for all enrolled courses
    const progressData = await Progress.find({ student: userId })
      .populate('course', 'title thumbnail category level duration price')
      .sort({ lastAccessed: -1 });

    // Calculate statistics
    const totalEnrolledCourses = user.enrolledCourses.length;
    const totalCompletedLessons = progressData.reduce((total, progress) => {
      return total + progress.completedLessons.length;
    }, 0);
    
    const completedCourses = progressData.filter(progress => progress.isCompleted).length;
    const certificatesEarned = progressData.filter(progress => progress.certificate).length;

    // Calculate total time spent
    const totalTimeSpent = progressData.reduce((total, progress) => {
      return total + (progress.timeSpent || 0);
    }, 0);

    // Get recent activity (last 10 progress updates)
    const recentActivity = progressData
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, 10)
      .map(progress => ({
        courseId: progress.course._id,
        courseTitle: progress.course.title,
        progress: progress.overallProgress,
        lastAccessed: progress.lastAccessed,
        isCompleted: progress.isCompleted,
        certificate: progress.certificate
      }));

    // Format enrolled courses with progress
    const enrolledCoursesWithProgress = user.enrolledCourses.map(course => {
      const progress = progressData.find(p => p.course._id.toString() === course._id.toString());
      
      // Calculate total lessons in course
      const totalLessons = course.curriculum ? 
        course.curriculum.reduce((total, week) => total + week.lessons.length, 0) : 0;
      
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        price: course.price,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        enrolledAt: course.enrolledAt || course.createdAt,
        progress: progress ? {
          overallProgress: progress.overallProgress,
          completedLessons: progress.completedLessons.length,
          totalLessons: totalLessons,
          timeSpent: progress.timeSpent,
          lastAccessed: progress.lastAccessed,
          isCompleted: progress.isCompleted,
          completionDate: progress.completionDate,
          certificate: progress.certificate,
          currentWeek: progress.currentWeek
        } : {
          overallProgress: 0,
          completedLessons: 0,
          totalLessons: totalLessons,
          timeSpent: 0,
          lastAccessed: null,
          isCompleted: false,
          completionDate: null,
          certificate: '',
          currentWeek: 1
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        statistics: {
          totalEnrolledCourses,
          totalCompletedLessons,
          completedCourses,
          certificatesEarned,
          totalTimeSpent
        },
        enrolledCourses: enrolledCoursesWithProgress,
        recentActivity,
        progressData: progressData.map(progress => ({
          courseId: progress.course._id,
          courseTitle: progress.course.title,
          completedLessons: progress.completedLessons,
          overallProgress: progress.overallProgress,
          timeSpent: progress.timeSpent,
          lastAccessed: progress.lastAccessed,
          isCompleted: progress.isCompleted,
          completionDate: progress.completionDate,
          certificate: progress.certificate,
          currentWeek: progress.currentWeek
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        enrolledCourses: user.enrolledCourses,
        notifications: user.notifications,
        privacy: user.privacy,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  protect,
  validateProfileUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const fieldsToUpdate = {
        name: req.body.name,
        bio: req.body.bio,
        avatar: req.body.avatar,
        phone: req.body.phone,
        location: req.body.location,
        website: req.body.website,
        socialLinks: req.body.socialLinks,
      };

      // Remove undefined values
      Object.keys(fieldsToUpdate).forEach(
        key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
      );

      const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          website: user.website,
          socialLinks: user.socialLinks,
        },
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
      });
    }
  },
);

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', protect, uploadSingle, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Update user's avatar in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: fileUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: fileUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
router.put('/notifications', protect, async (req, res) => {
  try {
    const { notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notifications },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      notifications: user.notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update privacy settings
// @route   PUT /api/users/privacy
// @access  Private
router.put('/privacy', protect, async (req, res) => {
  try {
    const { privacy } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { privacy },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: user.privacy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update last login
// @route   PUT /api/users/last-login
// @access  Private
router.put('/last-login', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastLogin: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Last login updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
