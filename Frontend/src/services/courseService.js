import { apiService } from './apiService';

// Course API - Using the comprehensive apiService
export const courseService = {
  // Get all courses with filters
  getCourses: async (filters = {}) => {
    try {
      console.log('Fetching courses with filters:', filters);
      const courses = await apiService.getCourses();
      console.log('Courses response:', courses);
      return { success: true, data: courses };
    } catch (error) {
      console.error('Course service error:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourse: async (courseId) => {
    try {
      const course = await apiService.getCourse(courseId);
      return { success: true, data: course };
    } catch (error) {
      throw error;
    }
  },

  // Create course (instructor/admin only)
  createCourse: async (courseData) => {
    try {
      const course = await apiService.createCourse(courseData);
      return { success: true, data: course };
    } catch (error) {
      throw error;
    }
  },

  // Update course (instructor/admin only)
  updateCourse: async (courseId, courseData) => {
    try {
      const course = await apiService.updateCourse(courseId, courseData);
      return { success: true, data: course };
    } catch (error) {
      throw error;
    }
  },

  // Delete course (instructor/admin only)
  deleteCourse: async (courseId) => {
    try {
      await apiService.deleteCourse(courseId);
      return { success: true, message: 'Course deleted successfully' };
    } catch (error) {
      throw error;
    }
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    try {
      const enrollment = await apiService.enrollInCourse(courseId);
      return { success: true, data: enrollment };
    } catch (error) {
      throw error;
    }
  },

  // Get user's enrolled courses
  getMyCourses: async () => {
    try {
      const courses = await apiService.getCourses();
      return { success: true, data: courses };
    } catch (error) {
      throw error;
    }
  },

  // Add course review
  addReview: async (courseId, reviewData) => {
    try {
      // This would need to be added to apiService if not already present
      throw new Error('Add review functionality needs to be implemented in apiService');
    } catch (error) {
      throw error;
    }
  },
};

export default courseService;
