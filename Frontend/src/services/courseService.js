import api from './api';

// Course API
export const courseService = {
  // Get all courses with filters
  getCourses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.search) params.append('search', filters.search);
      if (filters.published !== undefined) params.append('published', filters.published);

      const url = `/courses?${params.toString()}`;
      console.log('Fetching courses from:', url);
      
      const response = await api.get(url);
      console.log('Courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Course service error:', error);
      console.error('Error response:', error.response);
      throw error.response?.data || error;
    }
  },

  // Get course by ID
  getCourse: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create course (instructor/admin only)
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update course (instructor/admin only)
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete course (instructor/admin only)
  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's enrolled courses
  getMyCourses: async () => {
    try {
      const response = await api.get('/courses/my-courses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add course review
  addReview: async (courseId, reviewData) => {
    try {
      const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default courseService;
