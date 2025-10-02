import api from './api';

// Subscription Plans API
export const subscriptionService = {
  // Get available subscription plans
  getPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user's subscription
  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new subscription
  createSubscription: async (plan, billingCycle) => {
    try {
      const response = await api.post('/subscriptions/create', {
        plan,
        billingCycle,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upgrade subscription plan
  upgradeSubscription: async (plan, billingCycle) => {
    try {
      const response = await api.put('/subscriptions/upgrade', {
        plan,
        billingCycle,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (reason) => {
    try {
      const response = await api.put('/subscriptions/cancel', {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get subscription usage statistics
  getUsage: async () => {
    try {
      const response = await api.get('/subscriptions/usage');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's payment history
  getPayments: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/subscriptions/payments', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment invoice
  getInvoice: async (paymentId) => {
    try {
      const response = await api.get(`/subscriptions/invoice/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Payment API
export const paymentService = {
  // Create a new payment
  createPayment: async (subscriptionId, paymentMethod, amount, gatewayResponse) => {
    try {
      const response = await api.post('/payments/create', {
        subscriptionId,
        paymentMethod,
        amount,
        gatewayResponse,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark payment as completed
  completePayment: async (paymentId, gatewayTransactionId, gatewayResponse) => {
    try {
      const response = await api.put(`/payments/${paymentId}/complete`, {
        gatewayTransactionId,
        gatewayResponse,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark payment as failed
  failPayment: async (paymentId, reason) => {
    try {
      const response = await api.put(`/payments/${paymentId}/fail`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Process refund
  processRefund: async (paymentId, amount, reason) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, {
        amount,
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment details
  getPayment: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get payment statistics
  getPaymentStats: async (startDate, endDate) => {
    try {
      const response = await api.get('/payments/stats', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get recent payments
  getRecentPayments: async (limit = 10) => {
    try {
      const response = await api.get('/payments/recent', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get all payments
  getAllPayments: async (page = 1, limit = 20, filters = {}) => {
    try {
      const response = await api.get('/payments/all', {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default subscriptionService;
