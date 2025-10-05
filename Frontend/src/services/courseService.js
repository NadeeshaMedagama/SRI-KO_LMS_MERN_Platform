import { apiService } from './apiService';

// Course API - Using the comprehensive apiService
export const courseService = {
  // Get all courses with filters
  getCourses: async (filters = {}) => {
    try {
      console.log('Fetching courses with filters:', filters);
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.published !== undefined) queryParams.append('published', filters.published);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/courses?${queryString}` : '/courses';
      
      console.log('Making API request to:', url);
      
      // Make direct API call to get the correct response format
      const response = await fetch(`${window?.configs?.apiUrl || 'http://localhost:5000'}/api${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Courses API response:', data);
      
      // Return the response in the format expected by CoursesPage
      return {
        success: data.success,
        courses: data.courses || [],
        page: data.page || 1,
        pages: data.pages || 1,
        total: data.total || 0,
        count: data.count || 0
      };
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
