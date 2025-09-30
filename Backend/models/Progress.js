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

// Calculate overall progress
progressSchema.methods.calculateProgress = function (course) {
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
