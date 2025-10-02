const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Payment must belong to a user'],
    },
    subscription: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subscription',
      required: [true, 'Payment must belong to a subscription'],
    },
    amount: {
      type: Number,
      required: [true, 'Please specify payment amount'],
    },
    currency: {
      type: String,
      default: 'LKR',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'digital_wallet', 'cash', 'cheque'],
      required: [true, 'Please specify payment method'],
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'paypal', 'razorpay', 'payhere', 'manual'],
      default: 'manual',
    },
    gatewayTransactionId: {
      type: String,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    billingPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    plan: {
      type: String,
      enum: ['starter', 'pro', 'premium'],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundDate: {
      type: Date,
    },
    refundReason: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });
paymentSchema.index({ receiptNumber: 1 }, { unique: true, sparse: true });

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment method display
paymentSchema.virtual('paymentMethodDisplay').get(function () {
  const methodMap = {
    credit_card: 'Credit Card',
    bank_transfer: 'Bank Transfer',
    digital_wallet: 'Digital Wallet',
    cash: 'Cash',
    cheque: 'Cheque',
  };
  return methodMap[this.paymentMethod] || this.paymentMethod;
});

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function (gatewayTransactionId, gatewayResponse) {
  this.status = 'completed';
  this.paidDate = new Date();
  this.gatewayTransactionId = gatewayTransactionId;
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = function (reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function (amount, reason) {
  this.status = 'refunded';
  this.refundAmount = amount || this.amount;
  this.refundReason = reason;
  this.refundDate = new Date();
  return this.save();
};

// Method to generate invoice number
paymentSchema.methods.generateInvoiceNumber = function () {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  this.invoiceNumber = `INV-${year}${month}-${random}`;
  return this.invoiceNumber;
};

// Method to generate receipt number
paymentSchema.methods.generateReceiptNumber = function () {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  this.receiptNumber = `RCP-${year}${month}-${random}`;
  return this.receiptNumber;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const result = {
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    completedAmount: 0,
  };

  stats.forEach(stat => {
    result.total += stat.count;
    result.totalAmount += stat.totalAmount;
    
    if (stat._id === 'completed') {
      result.completed = stat.count;
      result.completedAmount = stat.totalAmount;
    } else if (stat._id === 'pending') {
      result.pending = stat.count;
    } else if (stat._id === 'failed') {
      result.failed = stat.count;
    } else if (stat._id === 'refunded') {
      result.refunded = stat.count;
    }
  });

  return result;
};

// Static method to get revenue by plan
paymentSchema.statics.getRevenueByPlan = async function (startDate, endDate) {
  const matchStage = { status: 'completed' };
  if (startDate && endDate) {
    matchStage.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

// Static method to get monthly revenue
paymentSchema.statics.getMonthlyRevenue = async function (year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$paymentDate' },
          year: { $year: '$paymentDate' },
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);
};

// Pre-save middleware to generate invoice and receipt numbers
paymentSchema.pre('save', function (next) {
  if (this.isNew && !this.invoiceNumber) {
    this.generateInvoiceNumber();
  }
  if (this.isNew && this.status === 'completed' && !this.receiptNumber) {
    this.generateReceiptNumber();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
