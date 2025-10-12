import apiService from './apiService';

const certificateService = {
  // Get all certificates with pagination and filters
  getAllCertificates: async (page = 1, limit = 20, filters = {}) => {
    try {
      console.log('🔍 Getting all certificates...', { page, limit, filters });
      const response = await apiService.getAllCertificates(page, limit, filters);
      console.log('📊 Certificates received:', response);
      return response;
    } catch (error) {
      console.error('Error getting certificates:', error);
      throw error;
    }
  },

  // Get certificate statistics
  getCertificateStats: async () => {
    try {
      console.log('🔍 Getting certificate stats...');
      const response = await apiService.getCertificateStats();
      console.log('📊 Certificate stats received:', response);
      return response;
    } catch (error) {
      console.error('Error getting certificate stats:', error);
      throw error;
    }
  },

  // Get students eligible for certificates
  getEligibleStudents: async (courseId = null) => {
    try {
      console.log('🔍 Getting eligible students...', { courseId });
      const response = await apiService.getEligibleStudents(courseId);
      console.log('📊 Eligible students received:', response);
      return response;
    } catch (error) {
      console.error('Error getting eligible students:', error);
      throw error;
    }
  },

  // Create a new certificate
  createCertificate: async (certificateData) => {
    try {
      console.log('🔍 Creating certificate...', certificateData);
      const response = await apiService.createCertificate(certificateData);
      console.log('📊 Certificate created:', response);
      return response;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  },

  // Update certificate status
  updateCertificateStatus: async (certificateId, status, certificateUrl = null) => {
    try {
      console.log('🔍 Updating certificate status...', { certificateId, status, certificateUrl });
      const response = await apiService.updateCertificateStatus(certificateId, status, certificateUrl);
      console.log('📊 Certificate status updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating certificate status:', error);
      throw error;
    }
  },

  // Send certificate to student
  sendCertificate: async (certificateId) => {
    try {
      console.log('🔍 Sending certificate...', { certificateId });
      const response = await apiService.sendCertificate(certificateId);
      console.log('📊 Certificate sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending certificate:', error);
      throw error;
    }
  },

  // Get certificate by ID
  getCertificate: async (certificateId) => {
    try {
      console.log('🔍 Getting certificate...', { certificateId });
      const response = await apiService.getCertificate(certificateId);
      console.log('📊 Certificate received:', response);
      return response;
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  },

  // Delete certificate
  deleteCertificate: async (certificateId) => {
    try {
      console.log('🔍 Deleting certificate...', { certificateId });
      const response = await apiService.deleteCertificate(certificateId);
      console.log('📊 Certificate deleted:', response);
      return response;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  }
};

export default certificateService;
