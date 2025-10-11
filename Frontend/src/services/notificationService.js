import apiService from './apiService';

const notificationService = {
  // Get active notifications for current user
  getNotifications: async () => {
    try {
      console.log('🔍 Getting notifications...');
      const response = await apiService.get('/notifications');
      console.log('📊 Notifications received:', response);
      return response;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Get all notifications (admin only)
  getAllNotifications: async (page = 1, limit = 20, filters = {}) => {
    try {
      console.log('🔍 Getting all notifications...', { page, limit, filters });
      const response = await apiService.getAllNotifications(page, limit, filters);
      console.log('📊 All notifications received:', response);
      return response;
    } catch (error) {
      console.error('Error getting all notifications:', error);
      throw error;
    }
  },

  // Get notification statistics (admin only)
  getNotificationStats: async () => {
    try {
      console.log('🔍 Getting notification stats...');
      const response = await apiService.getNotificationStats();
      console.log('📊 Notification stats received:', response);
      return response;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  },

  // Get notification by ID
  getNotification: async (notificationId) => {
    try {
      console.log('🔍 Getting notification...', { notificationId });
      const response = await apiService.getNotification(notificationId);
      console.log('📊 Notification received:', response);
      return response;
    } catch (error) {
      console.error('Error getting notification:', error);
      throw error;
    }
  },

  // Create new notification (admin only)
  createNotification: async (notificationData) => {
    try {
      console.log('🔍 Creating notification...', notificationData);
      const response = await apiService.createNotification(notificationData);
      console.log('📊 Notification created:', response);
      return response;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Update notification (admin only)
  updateNotification: async (notificationId, notificationData) => {
    try {
      console.log('🔍 Updating notification...', { notificationId, notificationData });
      const response = await apiService.updateNotification(notificationId, notificationData);
      console.log('📊 Notification updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  // Delete notification (admin only)
  deleteNotification: async (notificationId) => {
    try {
      console.log('🔍 Deleting notification...', { notificationId });
      const response = await apiService.deleteNotification(notificationId);
      console.log('📊 Notification deleted:', response);
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Toggle notification pin status (admin only)
  togglePinNotification: async (notificationId) => {
    try {
      console.log('🔍 Toggling notification pin...', { notificationId });
      const response = await apiService.togglePinNotification(notificationId);
      console.log('📊 Notification pin toggled:', response);
      return response;
    } catch (error) {
      console.error('Error toggling notification pin:', error);
      throw error;
    }
  },

  // Toggle notification active status (admin only)
  toggleActiveNotification: async (notificationId) => {
    try {
      console.log('🔍 Toggling notification active status...', { notificationId });
      const response = await apiService.toggleActiveNotification(notificationId);
      console.log('📊 Notification active status toggled:', response);
      return response;
    } catch (error) {
      console.error('Error toggling notification active status:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      console.log('🔍 Marking notification as read...', { notificationId });
      const response = await apiService.markNotificationAsRead(notificationId);
      console.log('📊 Notification marked as read:', response);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark notification as clicked
  markAsClicked: async (notificationId) => {
    try {
      console.log('🔍 Marking notification as clicked...', { notificationId });
      const response = await apiService.markNotificationAsClicked(notificationId);
      console.log('📊 Notification marked as clicked:', response);
      return response;
    } catch (error) {
      console.error('Error marking notification as clicked:', error);
      throw error;
    }
  },

  // Send notification to specific users (admin only)
  sendToUsers: async (notificationData, userIds) => {
    try {
      console.log('🔍 Sending notification to users...', { notificationData, userIds });
      const response = await apiService.sendNotificationToUsers(notificationData, userIds);
      console.log('📊 Notification sent to users:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification to users:', error);
      throw error;
    }
  },

  // Send notification to parents (admin only)
  sendToParents: async (notificationData, studentIds) => {
    try {
      console.log('🔍 Sending notification to parents...', { notificationData, studentIds });
      const response = await apiService.sendNotificationToParents(notificationData, studentIds);
      console.log('📊 Notification sent to parents:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification to parents:', error);
      throw error;
    }
  },

  // Get target users for notification (admin only)
  getTargetUsers: async (role, courseId, search) => {
    try {
      console.log('🔍 Getting target users...', { role, courseId, search });
      const response = await apiService.getNotificationTargetUsers(role, courseId, search);
      console.log('📊 Target users received:', response);
      return response;
    } catch (error) {
      console.error('Error getting target users:', error);
      throw error;
    }
  }
};

export default notificationService;
