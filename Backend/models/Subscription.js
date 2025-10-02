const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Subscription must belong to a user'],
    },
    plan: {
      type: String,
      enum: ['starter', 'pro', 'premium'],
      required: [true, 'Please specify a subscription plan'],
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: [true, 'Please specify billing cycle'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
      default: 'trial',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify subscription end date'],
    },
    nextBillingDate: {
      type: Date,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify subscription amount'],
    },
    currency: {
      type: String,
      default: 'LKR',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'digital_wallet', 'invoice'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    trialEndDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    features: {
      maxCourses: {
        type: Number,
        default: 5,
      },
      maxStudents: {
        type: Number,
        default: 50,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
      apiAccess: {
        type: Boolean,
        default: false,
      },
      whiteLabel: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      ssoIntegration: {
        type: Boolean,
        default: false,
      },
      customDomain: {
        type: Boolean,
        default: false,
      },
      dedicatedManager: {
        type: Boolean,
        default: false,
      },
    },
    usage: {
      coursesCreated: {
        type: Number,
        default: 0,
      },
      studentsEnrolled: {
        type: Number,
        default: 0,
      },
      apiCalls: {
        type: Number,
        default: 0,
      },
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && this.endDate > new Date();
});

// Virtual for checking if subscription is in trial
subscriptionSchema.virtual('isTrial').get(function () {
  return this.status === 'trial' && this.trialEndDate > new Date();
});

// Method to check if user can create more courses
subscriptionSchema.methods.canCreateCourse = function () {
  if (this.plan === 'starter') {
    return this.usage.coursesCreated < this.features.maxCourses;
  }
  return true; // Pro and Premium have unlimited courses
};

// Method to check if user can enroll more students
subscriptionSchema.methods.canEnrollStudents = function (count = 1) {
  if (this.plan === 'starter' || this.plan === 'pro') {
    return this.usage.studentsEnrolled + count <= this.features.maxStudents;
  }
  return true; // Premium has unlimited students
};

// Method to update usage
subscriptionSchema.methods.updateUsage = function (type, increment = 1) {
  if (type === 'course') {
    this.usage.coursesCreated += increment;
  } else if (type === 'student') {
    this.usage.studentsEnrolled += increment;
  } else if (type === 'api') {
    this.usage.apiCalls += increment;
  }
  return this.save();
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.autoRenew = false;
  return this.save();
};

// Method to renew subscription
subscriptionSchema.methods.renew = function () {
  if (this.billingCycle === 'monthly') {
    this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.nextBillingDate = this.endDate;
  } else {
    this.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    this.nextBillingDate = this.endDate;
  }
  this.status = 'active';
  return this.save();
};

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function (plan) {
  const features = {
    starter: {
      maxCourses: 5,
      maxStudents: 50,
      customBranding: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      ssoIntegration: false,
      customDomain: false,
      dedicatedManager: false,
    },
    pro: {
      maxCourses: -1, // unlimited
      maxStudents: 500,
      customBranding: true,
      apiAccess: true,
      whiteLabel: false,
      prioritySupport: true,
      ssoIntegration: false,
      customDomain: false,
      dedicatedManager: false,
    },
    premium: {
      maxCourses: -1, // unlimited
      maxStudents: -1, // unlimited
      customBranding: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      ssoIntegration: true,
      customDomain: true,
      dedicatedManager: true,
    },
  };
  return features[plan] || features.starter;
};

// Static method to get plan pricing
subscriptionSchema.statics.getPlanPricing = function (plan, billingCycle) {
  const pricing = {
    starter: {
      monthly: 0,
      yearly: 0,
    },
    pro: {
      monthly: 15000,
      yearly: 150000,
    },
    premium: {
      monthly: 35000,
      yearly: 350000,
    },
  };
  return pricing[plan]?.[billingCycle] || 0;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
