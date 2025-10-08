const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'issued', 'sent', 'delivered'],
    default: 'pending'
  },
  certificateUrl: {
    type: String,
    default: ''
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate unique certificate number
certificateSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.certificateNumber = `CERT-${String(count + 1).padStart(6, '0')}-${new Date().getFullYear()}`;
  }
  next();
});

// Static method to get certificates by student
certificateSchema.statics.getByStudent = async function(studentId) {
  return await this.find({ student: studentId })
    .populate('course', 'title description')
    .populate('issuedBy', 'name email')
    .sort({ issuedDate: -1 });
};

// Static method to get certificates by course
certificateSchema.statics.getByCourse = async function(courseId) {
  return await this.find({ course: courseId })
    .populate('student', 'name email')
    .populate('issuedBy', 'name email')
    .sort({ issuedDate: -1 });
};

// Static method to get all certificates with pagination
certificateSchema.statics.getAllCertificates = async function(page = 1, limit = 20, filters = {}) {
  const skip = (page - 1) * limit;
  const query = {};

  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.course) {
    query.course = filters.course;
  }
  if (filters.student) {
    query.student = filters.student;
  }
  if (filters.dateFrom || filters.dateTo) {
    query.issuedDate = {};
    if (filters.dateFrom) {
      query.issuedDate.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.issuedDate.$lte = new Date(filters.dateTo);
    }
  }

  const certificates = await this.find(query)
    .populate('student', 'name email')
    .populate('course', 'title description')
    .populate('issuedBy', 'name email')
    .sort({ issuedDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    certificates,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get certificate statistics
certificateSchema.statics.getCertificateStats = async function() {
  const total = await this.countDocuments();
  const pending = await this.countDocuments({ status: 'pending' });
  const issued = await this.countDocuments({ status: 'issued' });
  const sent = await this.countDocuments({ status: 'sent' });
  const delivered = await this.countDocuments({ status: 'delivered' });

  // Get certificates by month for the current year
  const currentYear = new Date().getFullYear();
  const monthlyStats = await this.aggregate([
    {
      $match: {
        issuedDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$issuedDate' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get certificates by course
  const courseStats = await this.aggregate([
    {
      $group: {
        _id: '$course',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'courseInfo'
      }
    },
    {
      $unwind: '$courseInfo'
    },
    {
      $project: {
        courseName: '$courseInfo.title',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return {
    total,
    pending,
    issued,
    sent,
    delivered,
    monthlyStats,
    courseStats
  };
};

module.exports = mongoose.model('Certificate', certificateSchema);
