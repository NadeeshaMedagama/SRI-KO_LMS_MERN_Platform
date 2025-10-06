const mongoose = require('mongoose');

const joinUsSubmissionSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  age: {
    type: Number,
    min: [16, 'Age must be at least 16'],
    max: [80, 'Age cannot exceed 80']
  },

  // Korean Language Information
  currentLevel: {
    type: String,
    enum: [
      'Complete Beginner',
      'Beginner', 
      'Intermediate',
      'Advanced',
      'Native Level'
    ],
    default: 'Complete Beginner'
  },
  preferredTime: {
    type: String,
    enum: [
      'Morning (9:00 AM - 12:00 PM)',
      'Afternoon (1:00 PM - 4:00 PM)',
      'Evening (6:00 PM - 9:00 PM)',
      'Weekend Classes',
      'Flexible Schedule'
    ]
  },

  // Interests
  interests: [{
    type: String,
    enum: [
      'Korean Language Basics',
      'Business Korean',
      'Korean Culture',
      'K-Pop & K-Drama',
      'Korean Cuisine',
      'Travel Korean',
      'Academic Korean',
      'Korean Literature'
    ]
  }],

  // Additional Information
  hearAboutUs: {
    type: String,
    enum: [
      'social-media',
      'website',
      'referral',
      'advertisement',
      'search-engine',
      'other'
    ]
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },

  // Status and Processing
  status: {
    type: String,
    enum: ['pending', 'contacted', 'enrolled', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  contactedAt: {
    type: Date
  },
  contactedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
joinUsSubmissionSchema.index({ email: 1 });
joinUsSubmissionSchema.index({ status: 1 });
joinUsSubmissionSchema.index({ submittedAt: -1 });
joinUsSubmissionSchema.index({ currentLevel: 1 });

// Virtual for formatted submission date
joinUsSubmissionSchema.virtual('formattedSubmittedAt').get(function() {
  return this.submittedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to update status
joinUsSubmissionSchema.methods.updateStatus = function(newStatus, notes, contactedBy) {
  this.status = newStatus;
  if (notes) this.notes = notes;
  if (contactedBy) this.contactedBy = contactedBy;
  if (newStatus === 'contacted') this.contactedAt = new Date();
  return this.save();
};

// Static method to get submissions by status
joinUsSubmissionSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ submittedAt: -1 });
};

// Static method to get recent submissions
joinUsSubmissionSchema.statics.getRecent = function(limit = 10) {
  return this.find().sort({ submittedAt: -1 }).limit(limit);
};

// Static method to get statistics
joinUsSubmissionSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('JoinUsSubmission', joinUsSubmissionSchema);
