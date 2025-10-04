import { apiService } from './apiService';

// Subscription Plans API - Using the comprehensive apiService
export const subscriptionService = {
  // Get available subscription plans
  getPlans: async () => {
    try {
      const plans = await apiService.getSubscriptionPlans();
      return { success: true, data: plans };
    } catch (error) {
      throw error;
    }
  },

  // Get current user's subscription
  getCurrentSubscription: async () => {
    try {
      const subscription = await apiService.getCurrentSubscription();
      return { success: true, data: subscription };
    } catch (error) {
      throw error;
    }
  },

  // Create a new subscription
  createSubscription: async (plan, billingCycle) => {
    try {
      const subscription = await apiService.createSubscription(plan);
      return { success: true, data: subscription };
    } catch (error) {
      throw error;
    }
  },

  // Upgrade subscription plan
  upgradeSubscription: async (plan, billingCycle) => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Upgrade subscription functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (reason) => {
    try {
      await apiService.cancelSubscription();
      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      throw error;
    }
  },

  // Get subscription usage statistics
  getUsage: async () => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Get usage functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },

  // Get user's payment history
  getPayments: async (page = 1, limit = 10) => {
    try {
      const payments = await apiService.getPayments();
      return { success: true, data: payments };
    } catch (error) {
      throw error;
    }
  },

  // Get payment invoice
  getInvoice: async (paymentId) => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Get invoice functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },
};

// Payment API - Using the comprehensive apiService
export const paymentService = {
  // Create a new payment
  createPayment: async (subscriptionId, paymentMethod, amount, gatewayResponse) => {
    try {
      const payment = await apiService.createPayment(subscriptionId, amount);
      return { success: true, data: payment };
    } catch (error) {
      throw error;
    }
  },

  // Mark payment as completed
  completePayment: async (paymentId, gatewayTransactionId, gatewayResponse) => {
    try {
      const payment = await apiService.verifyPayment(paymentId);
      return { success: true, data: payment };
    } catch (error) {
      throw error;
    }
  },

  // Mark payment as failed
  failPayment: async (paymentId, reason) => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Fail payment functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },

  // Process refund
  processRefund: async (paymentId, amount, reason) => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Process refund functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },

  // Get payment details
  getPayment: async (paymentId) => {
    try {
      const payments = await apiService.getPayments();
      const payment = payments.find(p => p._id === paymentId);
      return { success: true, data: payment };
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get payment statistics
  getPaymentStats: async (startDate, endDate) => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Get payment stats functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get recent payments
  getRecentPayments: async (limit = 10) => {
    try {
      const payments = await apiService.getPayments();
      return { success: true, data: payments.slice(0, limit) };
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get all payments
  getAllPayments: async (page = 1, limit = 20, filters = {}) => {
    try {
      const payments = await apiService.getPayments();
      return { success: true, data: payments };
    } catch (error) {
      throw error;
    }
  },
};

export default subscriptionService;
