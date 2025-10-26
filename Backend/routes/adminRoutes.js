const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Announcement = require('../models/Announcement');
const DiscussionForum = require('../models/DiscussionForum');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateCourseCreation,
  handleValidationErrors,
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get payment statistics for admin dashboard
// @route   GET /api/admin/payment-stats
// @access  Private/Admin
router.get('/payment-stats', protect, authorize('admin'), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const { startDate, endDate } = req.query;

    const stats = await Payment.getPaymentStats(startDate, endDate);
    const revenueByPlan = await Payment.getRevenueByPlan(startDate, endDate);
    const monthlyRevenue = await Payment.getMonthlyRevenue(new Date().getFullYear());

    res.json({
      success: true,
      stats,
      revenueByPlan,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get recent payments for admin dashboard
// @route   GET /api/admin/recent-payments
// @access  Private/Admin
router.get('/recent-payments', protect, authorize('admin'), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const limit = parseInt(req.query.limit) || 10;

    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('subscription', 'plan billingCycle')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get all payments for admin dashboard
// @route   GET /api/admin/all-payments
// @access  Private/Admin
router.get('/all-payments', protect, authorize('admin'), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const { page = 1, limit = 20, status, plan, startDate, endDate } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    console.log('📊 Admin fetching payments with filter:', filter);

    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('subscription', 'plan billingCycle')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    console.log(`📊 Found ${payments.length} payments (total: ${total})`);

    res.json({
      success: true,
      payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update payment status (Admin only)
// @route   PUT /api/admin/payments/:id/status
// @access  Private/Admin
router.put('/payments/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    // Find and update payment
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Update status
    const oldStatus = payment.status;
    payment.status = status;
    
    if (notes) {
      payment.notes = notes;
    }

    // Set paidDate if status is completed
    if (status === 'completed' && oldStatus !== 'completed') {
      payment.paidDate = new Date();
      // Generate receipt number if not exists
      if (!payment.receiptNumber) {
        payment.generateReceiptNumber();
      }
    }

    // Set refund date if status is refunded
    if (status === 'refunded' && oldStatus !== 'refunded') {
      payment.refundDate = new Date();
    }

    await payment.save();

    console.log(`✅ Admin updated payment ${req.params.id} status: ${oldStatus} → ${status}`);

    res.json({
      success: true,
      payment,
      message: `Payment status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    // const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Calculate total revenue (simplified - you might want to add a Payment model)
    const courses = await Course.find({ isPublished: true });
    const totalRevenue = courses.reduce((sum, course) => {
      return sum + course.price * (course.enrolledStudents?.length || 0);
    }, 0);

    // Get completed courses count (simplified)
    const completedCourses = await Course.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalRevenue,
        activeUsers,
        completedCourses,
        pendingApprovals: 0, // You can implement this based on your needs
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
router.post(
  '/users',
  protect,
  authorize('admin'),
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role,
        bio,
        phone,
        location,
        website,
        isActive,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        bio,
        phone,
        location,
        website,
        isActive,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          website: user.website,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
);

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, bio, phone, location, website, isActive } =
      req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.bio = bio || user.bio;
    user.phone = phone || user.phone;
    user.location = location || user.location;
    user.website = website || user.website;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put(
  '/users/:id/status',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.isActive = isActive;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
);

// @desc    Get all courses with pagination and filtering
// @route   GET /api/admin/courses
// @access  Private/Admin
router.get('/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.isPublished = status === 'published';
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      courses,
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private/Admin
router.post(
  '/courses',
  protect,
  authorize('admin'),
  validateCourseCreation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        level,
        duration,
        price,
        instructor,
        isPublished,
        thumbnail,
        curriculum,
      } = req.body;

      // Validate instructor ID
      if (!instructor || !mongoose.Types.ObjectId.isValid(instructor)) {
        return res.status(400).json({
          success: false,
          message: 'Valid instructor ID is required',
        });
      }

      // Check if instructor exists
      const instructorExists = await User.findById(instructor);
      if (!instructorExists) {
        return res.status(400).json({
          success: false,
          message: 'Instructor not found',
        });
      }

      const course = await Course.create({
        title,
        description,
        category,
        level,
        duration,
        price,
        instructor,
        isPublished: isPublished || false,
        thumbnail: thumbnail || '',
        curriculum: curriculum || [],
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course,
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
);

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
router.put('/courses/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      price,
      instructor,
      isPublished,
      thumbnail,
      curriculum,
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Update course fields
    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.level = level || course.level;
    course.duration = duration || course.duration;
    course.price = price !== undefined ? price : course.price;
    course.instructor = instructor || course.instructor;
    course.isPublished =
      isPublished !== undefined ? isPublished : course.isPublished;
    course.thumbnail = thumbnail || course.thumbnail;
    course.curriculum = curriculum || course.curriculum;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
router.delete('/courses/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Toggle course status
// @route   PUT /api/admin/courses/:id/status
// @access  Private/Admin
router.put(
  '/courses/:id/status',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { isPublished } = req.body;

      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      course.isPublished = isPublished;
      await course.save();

      res.status(200).json({
        success: true,
        message: `Course ${isPublished ? 'published' : 'unpublished'} successfully`,
        course: {
          id: course._id,
          title: course.title,
          isPublished: course.isPublished,
        },
      });
    } catch (error) {
      console.error('Toggle course status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
);

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    // const period = req.query.period || '30';
    // const days = parseInt(period);

    // Get overview statistics
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Calculate total revenue
    const courses = await Course.find({ isPublished: true });
    const totalRevenue = courses.reduce((sum, course) => {
      return sum + course.price * (course.enrolledStudents?.length || 0);
    }, 0);

    // Get top courses
    const topCourses = await Course.find({ isPublished: true })
      .populate('instructor', 'name')
      .populate('enrolledStudents', 'name')
      .sort({ enrolledStudents: -1 })
      .limit(5);

    // Get recent activities (simplified)
    const recentActivities = [
      {
        message: 'New user registered',
        createdAt: new Date(),
      },
      {
        message: 'Course published',
        createdAt: new Date(),
      },
    ];

    // Get monthly statistics (simplified)
    const monthlyStats = [
      {
        month: 'January',
        year: 2024,
        users: 150,
        revenue: 5000,
      },
      {
        month: 'February',
        year: 2024,
        users: 200,
        revenue: 7500,
      },
    ];

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalCourses,
          totalRevenue,
          activeUsers,
          completedCourses: publishedCourses,
          averageRating: 4.5,
        },
        userGrowth: [],
        revenueData: [],
        courseStats: [],
        topCourses,
        userEngagement: [],
        monthlyStats,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Export analytics report
// @route   GET /api/admin/analytics/export
// @access  Private/Admin
router.get(
  '/analytics/export',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const format = req.query.format || 'pdf';
      // const period = req.query.period || '30';

      // This is a placeholder for export functionality
      // You would implement actual PDF/CSV generation here
      res.status(200).json({
        success: true,
        message: `Export functionality for ${format} format coming soon`,
      });
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },
);

// @desc    Get recent admin activities (users, notifications, announcements, forums)
// @route   GET /api/admin/activities
// @access  Private/Admin
router.get('/activities', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [recentUsers, recentNotifications, recentAnnouncements, recentForums] = await Promise.all([
      User.find().select('name email createdAt').sort({ createdAt: -1 }).limit(limit),
      require('../models/Notification').find().select('title createdAt').sort({ createdAt: -1 }).limit(limit),
      require('../models/Announcement').find().select('title createdAt').sort({ createdAt: -1 }).limit(limit),
      require('../models/DiscussionForum').find().select('title createdAt').sort({ createdAt: -1 }).limit(limit),
    ]);

    const activities = [];

    for (const u of recentUsers) {
      activities.push({ type: 'user_created', message: `Created user ${u.name || u.email}`, createdAt: u.createdAt });
    }
    for (const n of recentNotifications) {
      activities.push({ type: 'notification_created', message: `Created notification: ${n.title}`, createdAt: n.createdAt });
    }
    for (const a of recentAnnouncements) {
      activities.push({ type: 'announcement_created', message: `Created announcement: ${a.title}`, createdAt: a.createdAt });
    }
    for (const f of recentForums) {
      activities.push({ type: 'forum_created', message: `Created discussion forum: ${f.title}`, createdAt: f.createdAt });
    }

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sliced = activities.slice(0, limit);

    res.json({ success: true, activities: sliced });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
