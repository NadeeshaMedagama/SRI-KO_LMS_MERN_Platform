const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        lesson: {
          type: mongoose.Schema.ObjectId,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
    currentWeek: {
      type: Number,
      default: 1,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0, // in minutes
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completionDate: {
      type: Date,
    },
    certificate: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
progressSchema.index({ student: 1, course: 1 }, { unique: true });

// Pre-save middleware to automatically set completionDate when course is completed
progressSchema.pre('save', function(next) {
  // If isCompleted is being set to true and completionDate is not already set
  if (this.isCompleted && !this.completionDate) {
    this.completionDate = new Date();
    console.log(`✅ Auto-set completionDate for course completion`);
  }

  // If isCompleted changed from true to false, clear the completionDate
  if (this.isModified('isCompleted') && !this.isCompleted) {
    this.completionDate = undefined;
  }

  next();
});

// Calculate overall progress
progressSchema.methods.calculateProgress = function(course) {
  if (!course || !course.curriculum) return 0;

  const totalLessons = course.curriculum.reduce(
    (total, week) => total + week.lessons.length,
    0,
  );
  const completedCount = this.completedLessons.length;

  return totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;
};

module.exports = mongoose.model('Progress', progressSchema);
