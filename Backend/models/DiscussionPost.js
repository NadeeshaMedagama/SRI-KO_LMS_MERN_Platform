const mongoose = require('mongoose');

const discussionPostSchema = new mongoose.Schema({
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionForum',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
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
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dislikedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    dislikes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dislikedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  dislikeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
discussionPostSchema.index({ forum: 1, createdAt: -1 });
discussionPostSchema.index({ author: 1 });
discussionPostSchema.index({ isPinned: -1, createdAt: -1 });
discussionPostSchema.index({ isApproved: 1, createdAt: -1 });
discussionPostSchema.index({ likeCount: -1 });

// Pre-save middleware to update counts
discussionPostSchema.pre('save', function(next) {
  this.replyCount = this.replies.length;
  this.likeCount = this.likes.length;
  this.dislikeCount = this.dislikes.length;
  next();
});

// Static method to get posts by forum
discussionPostSchema.statics.getPostsByForum = async function(forumId, page = 1, limit = 20, filters = {}) {
  const skip = (page - 1) * limit;
  const query = { forum: forumId };

  // Apply filters
  if (filters.isPinned !== undefined) {
    query.isPinned = filters.isPinned;
  }
  if (filters.isApproved !== undefined) {
    query.isApproved = filters.isApproved;
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { content: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const posts = await this.find(query)
    .populate('author', 'name email avatar')
    .populate('approvedBy', 'name email')
    .populate('replies.author', 'name email avatar')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    posts,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get all posts (admin)
discussionPostSchema.statics.getAllPosts = async function(page = 1, limit = 20, filters = {}) {
  const skip = (page - 1) * limit;
  const query = {};

  // Apply filters
  if (filters.forum) {
    query.forum = filters.forum;
  }
  if (filters.author) {
    query.author = filters.author;
  }
  if (filters.isApproved !== undefined) {
    query.isApproved = filters.isApproved;
  }
  if (filters.isPinned !== undefined) {
    query.isPinned = filters.isPinned;
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { content: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const posts = await this.find(query)
    .populate('forum', 'title category')
    .populate('author', 'name email avatar')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    posts,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get post statistics
discussionPostSchema.statics.getPostStats = async function() {
  const total = await this.countDocuments();
  const approved = await this.countDocuments({ isApproved: true });
  const pending = await this.countDocuments({ isApproved: false });
  const pinned = await this.countDocuments({ isPinned: true });

  // Get posts by forum
  const forumStats = await this.aggregate([
    {
      $group: {
        _id: '$forum',
        count: { $sum: 1 },
        totalReplies: { $sum: '$replyCount' },
        totalLikes: { $sum: '$likeCount' }
      }
    },
    {
      $lookup: {
        from: 'discussionforums',
        localField: '_id',
        foreignField: '_id',
        as: 'forumInfo'
      }
    },
    {
      $unwind: '$forumInfo'
    },
    {
      $project: {
        forumTitle: '$forumInfo.title',
        forumCategory: '$forumInfo.category',
        count: 1,
        totalReplies: 1,
        totalLikes: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get most liked posts
  const mostLikedPosts = await this.find({ isApproved: true })
    .populate('forum', 'title category')
    .populate('author', 'name email')
    .sort({ likeCount: -1 })
    .limit(5);

  // Get recent posts
  const recentPosts = await this.find({ isApproved: true })
    .populate('forum', 'title category')
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    total,
    approved,
    pending,
    pinned,
    forumStats,
    mostLikedPosts,
    recentPosts
  };
};

// Instance method to add reply
discussionPostSchema.methods.addReply = async function(authorId, content) {
  const reply = {
    author: authorId,
    content: content,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.replies.push(reply);
  await this.save();
  
  return this;
};

// Instance method to like post
discussionPostSchema.methods.likePost = async function(userId) {
  // Remove from dislikes if exists
  this.dislikes = this.dislikes.filter(dislike => dislike.user.toString() !== userId.toString());
  
  // Add to likes if not already liked
  const alreadyLiked = this.likes.some(like => like.user.toString() === userId.toString());
  if (!alreadyLiked) {
    this.likes.push({ user: userId });
  }
  
  await this.save();
  return this;
};

// Instance method to dislike post
discussionPostSchema.methods.dislikePost = async function(userId) {
  // Remove from likes if exists
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  
  // Add to dislikes if not already disliked
  const alreadyDisliked = this.dislikes.some(dislike => dislike.user.toString() === userId.toString());
  if (!alreadyDisliked) {
    this.dislikes.push({ user: userId });
  }
  
  await this.save();
  return this;
};

// Instance method to increment view count
discussionPostSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
  return this;
};

// Instance method to check if user liked
discussionPostSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Instance method to check if user disliked
discussionPostSchema.methods.isDislikedBy = function(userId) {
  return this.dislikes.some(dislike => dislike.user.toString() === userId.toString());
};

module.exports = mongoose.model('DiscussionPost', discussionPostSchema);

