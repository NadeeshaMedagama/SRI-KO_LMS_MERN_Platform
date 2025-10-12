const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: [
      'general',
      'course_update',
      'assignment_reminder',
      'exam_schedule',
      'payment_due',
      'enrollment_confirmation',
      'certificate_ready',
      'system_maintenance',
      'special_event',
      'korean_culture_tip',
      'language_learning_tip',
      'parent_update',
      'teacher_announcement'
    ],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'admins', 'parents', 'specific_users'],
    default: 'all'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetRoles: [{
    type: String,
    enum: ['student', 'instructor', 'admin']
  }],
  targetCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Korean language specific fields
  koreanTitle: {
    type: String,
    trim: true,
    maxlength: 200
  },
  koreanMessage: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // Parent notification specific
  parentNotification: {
    isParentNotification: {
      type: Boolean,
      default: false
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Delivery settings
  deliveryMethods: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  // Statistics
  deliveryStats: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    },
    totalClicked: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ isActive: 1, expiresAt: 1 });
notificationSchema.index({ targetAudience: 1, isActive: 1 });
notificationSchema.index({ createdBy: 1 });
notificationSchema.index({ scheduledFor: 1, expiresAt: 1 });
notificationSchema.index({ type: 1, isActive: 1 });
notificationSchema.index({ 'parentNotification.studentId': 1 });

// Static method to get active notifications for a specific user
notificationSchema.statics.getActiveNotifications = async function(userId, userRole = 'student') {
  const now = new Date();
  const query = {
    isActive: true,
    scheduledFor: { $lte: now },
    expiresAt: { $gte: now },
    $or: [
      { targetAudience: 'all' },
      { targetAudience: userRole + 's' },
      { targetUsers: userId },
      { targetRoles: userRole }
    ]
  };

  const notifications = await this.find(query)
    .populate('createdBy', 'name email')
    .populate('targetCourses', 'title')
    .sort({ isPinned: -1, priority: -1, createdAt: -1 });

  return notifications;
};

// Static method to get all notifications with pagination (admin only)
notificationSchema.statics.getAllNotifications = async function(page = 1, limit = 20, filters = {}) {
  const skip = (page - 1) * limit;
  const query = {};

  // Apply filters
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.priority) {
    query.priority = filters.priority;
  }
  if (filters.targetAudience) {
    query.targetAudience = filters.targetAudience;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.isPinned !== undefined) {
    query.isPinned = filters.isPinned;
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { message: { $regex: filters.search, $options: 'i' } },
      { koreanTitle: { $regex: filters.search, $options: 'i' } },
      { koreanMessage: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const notifications = await this.find(query)
    .populate('createdBy', 'name email')
    .populate('targetUsers', 'name email')
    .populate('targetCourses', 'title')
    .sort({ isPinned: -1, priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    notifications,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get notification statistics
notificationSchema.statics.getNotificationStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const expired = await this.countDocuments({ 
    isActive: true, 
    expiresAt: { $lt: new Date() } 
  });
  const pinned = await this.countDocuments({ isPinned: true });

  // Get notifications by type
  const typeStats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get notifications by priority
  const priorityStats = await this.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get notifications by target audience
  const audienceStats = await this.aggregate([
    {
      $group: {
        _id: '$targetAudience',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get notifications by month for the current year
  const currentYear = new Date().getFullYear();
  const monthlyStats = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get delivery statistics
  const deliveryStats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalSent: { $sum: '$deliveryStats.totalSent' },
        totalRead: { $sum: '$deliveryStats.totalRead' },
        totalClicked: { $sum: '$deliveryStats.totalClicked' }
      }
    }
  ]);

  return {
    total,
    active,
    expired,
    pinned,
    typeStats,
    priorityStats,
    audienceStats,
    monthlyStats,
    deliveryStats: deliveryStats[0] || { totalSent: 0, totalRead: 0, totalClicked: 0 }
  };
};

// Static method to send notification to specific users
notificationSchema.statics.sendToUsers = async function(notificationData, userIds) {
  const notifications = [];
  
  for (const userId of userIds) {
    const notification = new this({
      ...notificationData,
      targetUsers: [userId],
      targetAudience: 'specific_users'
    });
    notifications.push(notification);
  }
  
  return await this.insertMany(notifications);
};

// Static method to send notification to parents
notificationSchema.statics.sendToParents = async function(notificationData, studentIds) {
  const notifications = [];
  
  for (const studentId of studentIds) {
    // Find parent of the student (assuming parent relationship exists)
    const student = await mongoose.model('User').findById(studentId).select('parentId');
    if (student && student.parentId) {
      const notification = new this({
        ...notificationData,
        parentNotification: {
          isParentNotification: true,
          studentId: studentId,
          parentId: student.parentId
        },
        targetUsers: [student.parentId],
        targetAudience: 'parents'
      });
      notifications.push(notification);
    }
  }
  
  return await this.insertMany(notifications);
};

// Instance method to mark as read by a user
notificationSchema.methods.markAsRead = async function(userId) {
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    this.deliveryStats.totalRead += 1;
    await this.save();
  }
  
  return this;
};

// Instance method to mark as clicked
notificationSchema.methods.markAsClicked = async function(userId) {
  this.deliveryStats.totalClicked += 1;
  await this.save();
  return this;
};

// Instance method to get read count
notificationSchema.methods.getReadCount = function() {
  return this.readBy.length;
};

// Instance method to check if read by user
notificationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Instance method to get read percentage
notificationSchema.methods.getReadPercentage = function() {
  if (this.deliveryStats.totalSent === 0) return 0;
  return Math.round((this.deliveryStats.totalRead / this.deliveryStats.totalSent) * 100);
};

module.exports = mongoose.model('Notification', notificationSchema);
