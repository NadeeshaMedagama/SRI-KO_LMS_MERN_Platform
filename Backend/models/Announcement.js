const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['general', 'course', 'system', 'maintenance', 'event'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'admins'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
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
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
announcementSchema.index({ isActive: 1, endDate: 1 });
announcementSchema.index({ targetAudience: 1, isActive: 1 });
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ startDate: 1, endDate: 1 });

// Static method to get active announcements for a specific audience
announcementSchema.statics.getActiveAnnouncements = async function(audience = 'all', userId = null) {
  const now = new Date();
  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { targetAudience: 'all' },
      { targetAudience: audience }
    ]
  };

  const announcements = await this.find(query)
    .populate('createdBy', 'name email')
    .sort({ isPinned: -1, priority: -1, createdAt: -1 });

  // If userId is provided, mark announcements as read
  if (userId) {
    const unreadAnnouncements = announcements.filter(announcement => 
      !announcement.readBy.some(read => read.user.toString() === userId.toString())
    );

    if (unreadAnnouncements.length > 0) {
      await this.updateMany(
        { _id: { $in: unreadAnnouncements.map(a => a._id) } },
        { $push: { readBy: { user: userId } } }
      );
    }
  }

  return announcements;
};

// Static method to get all announcements with pagination
announcementSchema.statics.getAllAnnouncements = async function(page = 1, limit = 20, filters = {}) {
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

  const announcements = await this.find(query)
    .populate('createdBy', 'name email')
    .sort({ isPinned: -1, priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    announcements,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get announcement statistics
announcementSchema.statics.getAnnouncementStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const inactive = await this.countDocuments({ isActive: false });
  const pinned = await this.countDocuments({ isPinned: true });

  // Get announcements by type
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

  // Get announcements by priority
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

  // Get announcements by target audience
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

  // Get announcements by month for the current year
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

  return {
    total,
    active,
    inactive,
    pinned,
    typeStats,
    priorityStats,
    audienceStats,
    monthlyStats
  };
};

// Instance method to mark as read by a user
announcementSchema.methods.markAsRead = async function(userId) {
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    await this.save();
  }
  
  return this;
};

// Instance method to get read count
announcementSchema.methods.getReadCount = function() {
  return this.readBy.length;
};

// Instance method to check if read by user
announcementSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

module.exports = mongoose.model('Announcement', announcementSchema);

