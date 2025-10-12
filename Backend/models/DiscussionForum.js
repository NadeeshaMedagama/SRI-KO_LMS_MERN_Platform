const mongoose = require('mongoose');

const discussionForumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: [
      'general',
      'korean-basics',
      'grammar',
      'vocabulary',
      'pronunciation',
      'conversation',
      'culture',
      'study-tips',
      'homework-help',
      'resources',
      'events',
      'introductions'
    ],
    default: 'general'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
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
  isLocked: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  rules: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  postCount: {
    type: Number,
    default: 0
  },
  lastPost: {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionPost'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date
    }
  },
  viewCount: {
    type: Number,
    default: 0
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for better query performance
discussionForumSchema.index({ category: 1, isActive: 1 });
discussionForumSchema.index({ level: 1, isActive: 1 });
discussionForumSchema.index({ createdBy: 1 });
discussionForumSchema.index({ isPinned: -1, lastPost: -1 });
discussionForumSchema.index({ postCount: -1 });

// Static method to get forums by category
discussionForumSchema.statics.getForumsByCategory = async function(category = null, level = null) {
  const query = { isActive: true };
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (level && level !== 'all') {
    query.level = { $in: [level, 'all'] };
  }

  const forums = await this.find(query)
    .populate('createdBy', 'name email')
    .populate('lastPost.author', 'name email')
    .sort({ isPinned: -1, lastPost: -1, createdAt: -1 });

  return forums;
};

// Static method to get all forums with pagination (admin)
discussionForumSchema.statics.getAllForums = async function(page = 1, limit = 20, filters = {}) {
  const skip = (page - 1) * limit;
  const query = {};

  // Apply filters
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.level) {
    query.level = filters.level;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.isPinned !== undefined) {
    query.isPinned = filters.isPinned;
  }
  if (filters.isLocked !== undefined) {
    query.isLocked = filters.isLocked;
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const forums = await this.find(query)
    .populate('createdBy', 'name email')
    .populate('lastPost.author', 'name email')
    .sort({ isPinned: -1, lastPost: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    forums,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get forum statistics
discussionForumSchema.statics.getForumStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const inactive = await this.countDocuments({ isActive: false });
  const pinned = await this.countDocuments({ isPinned: true });
  const locked = await this.countDocuments({ isLocked: true });

  // Get forums by category
  const categoryStats = await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalPosts: { $sum: '$postCount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get forums by level
  const levelStats = await this.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        totalPosts: { $sum: '$postCount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get most active forums
  const mostActiveForums = await this.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ postCount: -1 })
    .limit(5);

  // Get recent forums
  const recentForums = await this.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    total,
    active,
    inactive,
    pinned,
    locked,
    categoryStats,
    levelStats,
    mostActiveForums,
    recentForums
  };
};

// Instance method to increment post count
discussionForumSchema.methods.incrementPostCount = async function(postId, authorId) {
  this.postCount += 1;
  this.lastPost = {
    post: postId,
    author: authorId,
    date: new Date()
  };
  await this.save();
  return this;
};

// Instance method to increment view count
discussionForumSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
  return this;
};

// Instance method to subscribe user
discussionForumSchema.methods.subscribeUser = async function(userId) {
  if (!this.subscribers.includes(userId)) {
    this.subscribers.push(userId);
    await this.save();
  }
  return this;
};

// Instance method to unsubscribe user
discussionForumSchema.methods.unsubscribeUser = async function(userId) {
  this.subscribers = this.subscribers.filter(id => id.toString() !== userId.toString());
  await this.save();
  return this;
};

// Instance method to check if user is subscribed
discussionForumSchema.methods.isSubscribed = function(userId) {
  return this.subscribers.some(id => id.toString() === userId.toString());
};

module.exports = mongoose.model('DiscussionForum', discussionForumSchema);

