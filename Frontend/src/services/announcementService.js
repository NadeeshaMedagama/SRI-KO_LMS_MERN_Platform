import apiService from './apiService';
import apiUrl, { getWorkingApiUrl } from '../config/apiConfig';

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
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`${workingApiUrl}/announcements/all?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 All announcements received:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error getting all announcements:', error);
      throw error;
    }
  },

  // Get announcement statistics (admin only)
  getAnnouncementStats: async () => {
    try {
      console.log('🔍 Getting announcement stats...');
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const response = await fetch(`${workingApiUrl}/announcements/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Announcement stats received:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch announcement stats');
      }
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
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const response = await fetch(`${workingApiUrl}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Announcement created:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update announcement (admin only)
  updateAnnouncement: async (announcementId, announcementData) => {
    try {
      console.log('🔍 Updating announcement...', { announcementId, announcementData });
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const response = await fetch(`${workingApiUrl}/announcements/${announcementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(announcementData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Announcement updated:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete announcement (admin only)
  deleteAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Deleting announcement...', { announcementId });
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const response = await fetch(`${workingApiUrl}/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Announcement deleted:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Toggle announcement pin status (admin only)
  togglePinAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Toggling announcement pin...', { announcementId });
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const response = await fetch(`${workingApiUrl}/announcements/${announcementId}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Announcement pin toggled:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle pin status');
      }
    } catch (error) {
      console.error('Error toggling announcement pin:', error);
      throw error;
    }
  },

  // Toggle announcement active status (admin only)
  toggleActiveAnnouncement: async (announcementId) => {
    try {
      console.log('🔍 Toggling announcement active status...', { announcementId });
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const workingApiUrl = await getWorkingApiUrl();
      const response = await fetch(`${workingApiUrl}/announcements/${announcementId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Announcement active status toggled:', data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle active status');
      }
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

