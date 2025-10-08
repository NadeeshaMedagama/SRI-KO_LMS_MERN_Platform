import apiService from './apiService';

const announcementService = {
  // Get active announcements for current user
  getActiveAnnouncements: async () => {
    try {
      console.log('🔍 Getting active announcements...');
      const response = await apiService.getActiveAnnouncements();
      console.log('📊 Active announcements received:', response);
      return response;
    } catch (error) {
      console.error('Error getting active announcements:', error);
      throw error;
    }
  },

  // Get all announcements (admin only)
  getAllAnnouncements: async (page = 1, limit = 20, filters = {}) => {
    try {
      console.log('🔍 Getting all announcements...', { page, limit, filters });
      const response = await apiService.getAllAnnouncements(page, limit, filters);
      console.log('📊 All announcements received:', response);
      return response;
    } catch (error) {
      console.error('Error getting all announcements:', error);
      throw error;
    }
  },

  // Get announcement statistics (admin only)
  getAnnouncementStats: async () => {
    try {
      console.log('🔍 Getting announcement stats...');
      const response = await apiService.getAnnouncementStats();
      console.log('📊 Announcement stats received:', response);
      return response;
    } catch (error) {
      console.error('Error getting announcement stats:', error);
      throw error;
    }
  },

  // Get announcement by ID
  getAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Getting announcement...', { announcementId });
      const response = await apiService.getAnnouncement(announcementId);
      console.log('📊 Announcement received:', response);
      return response;
    } catch (error) {
      console.error('Error getting announcement:', error);
      throw error;
    }
  },

  // Create new announcement (admin only)
  createAnnouncement: async (announcementData) => {
    try {
      console.log('🔍 Creating announcement...', announcementData);
      const response = await apiService.createAnnouncement(announcementData);
      console.log('📊 Announcement created:', response);
      return response;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update announcement (admin only)
  updateAnnouncement: async (announcementId, announcementData) => {
    try {
      console.log('🔍 Updating announcement...', { announcementId, announcementData });
      const response = await apiService.updateAnnouncement(announcementId, announcementData);
      console.log('📊 Announcement updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete announcement (admin only)
  deleteAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Deleting announcement...', { announcementId });
      const response = await apiService.deleteAnnouncement(announcementId);
      console.log('📊 Announcement deleted:', response);
      return response;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Toggle announcement pin status (admin only)
  togglePinAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Toggling announcement pin...', { announcementId });
      const response = await apiService.togglePinAnnouncement(announcementId);
      console.log('📊 Announcement pin toggled:', response);
      return response;
    } catch (error) {
      console.error('Error toggling announcement pin:', error);
      throw error;
    }
  },

  // Toggle announcement active status (admin only)
  toggleActiveAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Toggling announcement active status...', { announcementId });
      const response = await apiService.toggleActiveAnnouncement(announcementId);
      console.log('📊 Announcement active status toggled:', response);
      return response;
    } catch (error) {
      console.error('Error toggling announcement active status:', error);
      throw error;
    }
  },

  // Mark announcement as read
  markAnnouncementAsRead: async (announcementId) => {
    try {
      console.log('🔍 Marking announcement as read...', { announcementId });
      const response = await apiService.markAnnouncementAsRead(announcementId);
      console.log('📊 Announcement marked as read:', response);
      return response;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  }
};

export default announcementService;
