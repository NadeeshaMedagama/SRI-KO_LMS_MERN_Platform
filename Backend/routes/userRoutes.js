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
    
    console.log('📊 Dashboard API: Fetching data for user:', userId);

    // Get user with enrolled courses - first get user to check enrolledCourses array
    const baseUser = await User.findById(userId);
    
    console.log('📊 Base user enrolledCourses count:', baseUser.enrolledCourses?.length || 0);
    console.log('📊 Base user enrolledCourses IDs:', baseUser.enrolledCourses);
    
    // Get user with enrolled courses populated
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Try to populate enrolled courses
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      try {
        // Get course IDs
        const courseIds = user.enrolledCourses.map(id => id._id || id);
        console.log('📊 Fetching courses with IDs:', courseIds);
        
        // Get courses directly with all fields
        const courses = await Course.find({ _id: { $in: courseIds } })
          .populate('instructor', 'name email avatar');
        
        console.log('📊 Found courses:', courses.length);
        if (courses.length > 0) {
          console.log('📊 First course:', courses[0].title);
        }
        
        user.enrolledCourses = courses;
      } catch (populateError) {
        console.error('⚠️ Error populating enrolledCourses:', populateError);
        // Keep the original user data even if populate fails
        user.enrolledCourses = user.enrolledCourses || [];
      }
    } else {
      console.log('⚠️ No enrolled courses found for user');
      user.enrolledCourses = [];
    }

    console.log('📊 Dashboard API: User enrolledCourses count:', user.enrolledCourses?.length || 0);
    console.log('📊 Dashboard API: User enrolledCourses:', user.enrolledCourses);

    // Get progress for all enrolled courses
    const progressData = await Progress.find({ student: userId })
      .populate('course', 'title thumbnail category level duration price')
      .sort({ lastAccessed: -1 });

    console.log('📊 Dashboard API: Progress data count:', progressData?.length || 0);

    // Calculate statistics
    const totalEnrolledCourses = user.enrolledCourses?.length || 0;
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
      .filter(progress => progress.course) // Filter out progress entries without course data
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, 10)
      .map(progress => ({
        courseId: progress.course._id,
        courseTitle: progress.course.title || 'Untitled Course',
        progress: progress.overallProgress || 0,
        lastAccessed: progress.lastAccessed,
        isCompleted: progress.isCompleted || false,
        certificate: progress.certificate || ''
      }));

    // Format enrolled courses with progress
    console.log('📊 Starting to format enrolled courses...');
    console.log('📊 User enrolledCourses before formatting:', user.enrolledCourses?.length || 0);
    
    const enrolledCoursesWithProgress = (user.enrolledCourses || []).map(course => {
      // Skip if course is null or undefined (possible if course was deleted)
      if (!course || !course._id) {
        console.warn('⚠️ Found invalid course in enrolledCourses:', course);
        return null;
      }
      
      console.log('📊 Processing course:', course._id, course.title);
      
      const progress = progressData.find(p => {
        if (!p.course || !p.course._id) return false;
        if (!course._id) return false;
        return p.course._id.toString() === course._id.toString();
      });
      
      console.log('📊 Found progress for course:', !!progress);
      
      // Calculate total lessons in course
      const totalLessons = course.curriculum ? 
        course.curriculum.reduce((total, week) => total + (week.lessons ? week.lessons.length : 0), 0) : 0;
      
      const formattedCourse = {
        _id: course._id,
        title: course.title || 'Untitled Course',
        description: course.description || '',
        category: course.category || 'other',
        level: course.level || 'beginner',
        duration: course.duration || 0,
        price: course.price || 0,
        thumbnail: course.thumbnail || '',
        instructor: course.instructor || { name: 'Unknown Instructor' },
        enrolledAt: course.createdAt, // Use course createdAt since enrolledAt doesn't exist
        progress: progress ? {
          overallProgress: progress.overallProgress || 0,
          completedLessons: progress.completedLessons ? progress.completedLessons.length : 0,
          totalLessons: totalLessons,
          timeSpent: progress.timeSpent || 0,
          lastAccessed: progress.lastAccessed,
          isCompleted: progress.isCompleted || false,
          completionDate: progress.completionDate,
          certificate: progress.certificate || '',
          currentWeek: progress.currentWeek || 1
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
      
      console.log('📊 Formatted course:', formattedCourse.title);
      return formattedCourse;
    }).filter(course => course !== null); // Filter out null courses
    
    console.log('📊 Dashboard API: Final enrolledCoursesWithProgress count:', enrolledCoursesWithProgress.length);
    console.log('📊 Dashboard API: Sample enrolled course:', enrolledCoursesWithProgress[0]?.title || 'None');
    
    // Verify the response structure
    const responseData = {
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
      progressData: progressData
        .filter(progress => progress.course)
        .map(progress => ({
          courseId: progress.course._id,
          courseTitle: progress.course.title || 'Untitled Course',
          completedLessons: progress.completedLessons || [],
          overallProgress: progress.overallProgress || 0,
          timeSpent: progress.timeSpent || 0,
          lastAccessed: progress.lastAccessed,
          isCompleted: progress.isCompleted || false,
          completionDate: progress.completionDate,
          certificate: progress.certificate || '',
          currentWeek: progress.currentWeek || 1
        }))
    };
    
    console.log('📊 Dashboard API: Response data structure:');
    console.log('  - enrolledCourses count:', responseData.enrolledCourses.length);
    console.log('  - statistics:', JSON.stringify(responseData.statistics, null, 2));

    res.status(200).json({
      success: true,
      data: responseData
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
