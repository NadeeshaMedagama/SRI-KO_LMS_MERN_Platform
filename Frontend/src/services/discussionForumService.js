import apiService from './apiService';

const discussionForumService = {
  // Get forums for users
  getForums: async (category = null, level = null) => {
    try {
      console.log('🔍 Getting forums...', { category, level });
      const response = await apiService.getForums(category, level);
      console.log('📊 Forums received:', response);
      return response;
    } catch (error) {
      console.error('Error getting forums:', error);
      throw error;
    }
  },

  // Get all forums (admin only)
  getAllForums: async (page = 1, limit = 20, filters = {}) => {
    try {
      console.log('🔍 Getting all forums...', { page, limit, filters });
      const response = await apiService.getAllForums(page, limit, filters);
      console.log('📊 All forums received:', response);
      return response;
    } catch (error) {
      console.error('Error getting all forums:', error);
      throw error;
    }
  },

  // Get forum statistics (admin only)
  getForumStats: async () => {
    try {
      console.log('🔍 Getting forum stats...');
      const response = await apiService.getForumStats();
      console.log('📊 Forum stats received:', response);
      return response;
    } catch (error) {
      console.error('Error getting forum stats:', error);
      throw error;
    }
  },

  // Get forum by ID
  getForum: async (forumId) => {
    try {
      console.log('🔍 Getting forum...', { forumId });
      const response = await apiService.getForum(forumId);
      console.log('📊 Forum received:', response);
      return response;
    } catch (error) {
      console.error('Error getting forum:', error);
      throw error;
    }
  },

  // Create new forum (admin only)
  createForum: async (forumData) => {
    try {
      console.log('🔍 Creating forum...', forumData);
      const response = await apiService.createForum(forumData);
      console.log('📊 Forum created:', response);
      return response;
    } catch (error) {
      console.error('Error creating forum:', error);
      throw error;
    }
  },

  // Update forum (admin only)
  updateForum: async (forumId, forumData) => {
    try {
      console.log('🔍 Updating forum...', { forumId, forumData });
      const response = await apiService.updateForum(forumId, forumData);
      console.log('📊 Forum updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating forum:', error);
      throw error;
    }
  },

  // Delete forum (admin only)
  deleteForum: async (forumId) => {
    try {
      console.log('🔍 Deleting forum...', { forumId });
      const response = await apiService.deleteForum(forumId);
      console.log('📊 Forum deleted:', response);
      return response;
    } catch (error) {
      console.error('Error deleting forum:', error);
      throw error;
    }
  },

  // Toggle forum pin status (admin only)
  togglePinForum: async (forumId) => {
    try {
      console.log('🔍 Toggling forum pin...', { forumId });
      const response = await apiService.togglePinForum(forumId);
      console.log('📊 Forum pin toggled:', response);
      return response;
    } catch (error) {
      console.error('Error toggling forum pin:', error);
      throw error;
    }
  },

  // Toggle forum active status (admin only)
  toggleActiveForum: async (forumId) => {
    try {
      console.log('🔍 Toggling forum active status...', { forumId });
      const response = await apiService.toggleActiveForum(forumId);
      console.log('📊 Forum active status toggled:', response);
      return response;
    } catch (error) {
      console.error('Error toggling forum active status:', error);
      throw error;
    }
  },

  // Subscribe to forum
  subscribeToForum: async (forumId) => {
    try {
      console.log('🔍 Subscribing to forum...', { forumId });
      const response = await apiService.subscribeToForum(forumId);
      console.log('📊 Subscribed to forum:', response);
      return response;
    } catch (error) {
      console.error('Error subscribing to forum:', error);
      throw error;
    }
  },

  // Unsubscribe from forum
  unsubscribeFromForum: async (forumId) => {
    try {
      console.log('🔍 Unsubscribing from forum...', { forumId });
      const response = await apiService.unsubscribeFromForum(forumId);
      console.log('📊 Unsubscribed from forum:', response);
      return response;
    } catch (error) {
      console.error('Error unsubscribing from forum:', error);
      throw error;
    }
  },

  // Get posts in forum
  getForumPosts: async (forumId, page = 1, limit = 20, filters = {}) => {
    try {
      console.log('🔍 Getting forum posts...', { forumId, page, limit, filters });
      const response = await apiService.getForumPosts(forumId, page, limit, filters);
      console.log('📊 Forum posts received:', response);
      return response;
    } catch (error) {
      console.error('Error getting forum posts:', error);
      throw error;
    }
  },

  // Create post in forum
  createForumPost: async (forumId, postData) => {
    try {
      console.log('🔍 Creating forum post...', { forumId, postData });
      const response = await apiService.createForumPost(forumId, postData);
      console.log('📊 Forum post created:', response);
      return response;
    } catch (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }
  }
};

export default discussionForumService;
