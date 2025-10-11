import axios, { AxiosInstance, AxiosResponse } from 'axios';
import apiUrl from '../config/apiConfig';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Course, 
  Video,
  Material,
  Progress,
  Enrollment,
  Payment,
  Subscription,
  SubscriptionPlan,
  Notification,
  ApiResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateVideoRequest,
  CreateMaterialRequest,
  AdminStats,
  SystemHealth,
  AdminAnalytics,
  SystemSettings
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token (prefer adminToken when available)
    this.api.interceptors.request.use(
      (config) => {
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('token');
        const token = adminToken || userToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🌐 LMS API: Making login request to:', this.api.defaults.baseURL + '/auth/login');
    console.log('🌐 LMS API: Request data:', credentials);
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
      console.log('🌐 LMS API: Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🌐 LMS API: Request failed:', error);
      console.error('🌐 LMS API: Error response:', error.response?.data);
      console.error('🌐 LMS API: Error status:', error.response?.status);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.get('/auth/me');
    return response.data.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.put('/auth/me', userData);
    return response.data.user;
  }

  // Generic HTTP methods for direct API calls
  async get(url: string): Promise<any> {
    const response = await this.api.get(url);
    return response;
  }

  async post(url: string, data?: any): Promise<any> {
    const response = await this.api.post(url, data);
    return response;
  }

  async put(url: string, data?: any): Promise<any> {
    const response = await this.api.put(url, data);
    return response;
  }

  async delete(url: string): Promise<any> {
    const response = await this.api.delete(url);
    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(password: string, token: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/reset-password', { password, token });
    return response.data;
  }

  // Course endpoints
  async getCourses(): Promise<Course[]> {
    const response: AxiosResponse<{ success: boolean; data: Course[] }> = await this.api.get('/courses');
    return response.data.data || [];
  }

  async getCourse(id: string): Promise<Course> {
    const response: AxiosResponse<{ success: boolean; data: Course }> = await this.api.get(`/courses/${id}`);
    return response.data.data!;
  }

  async createCourse(courseData: CreateCourseRequest): Promise<Course> {
    const response: AxiosResponse<{ success: boolean; data: Course }> = await this.api.post('/courses', courseData);
    return response.data.data!;
  }

  async updateCourse(id: string, courseData: UpdateCourseRequest): Promise<Course> {
    const response: AxiosResponse<{ success: boolean; data: Course }> = await this.api.put(`/courses/${id}`, courseData);
    return response.data.data!;
  }

  async deleteCourse(id: string): Promise<void> {
    await this.api.delete(`/courses/${id}`);
  }

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await this.api.post(`/courses/${courseId}/enroll`);
    return response.data.data!;
  }

  async unenrollFromCourse(courseId: string): Promise<void> {
    await this.api.delete(`/courses/${courseId}/enroll`);
  }

  // Video endpoints
  async addVideoToCourse(courseId: string, videoData: CreateVideoRequest): Promise<Video> {
    const response: AxiosResponse<{ success: boolean; data: Video }> = await this.api.post(`/courses/${courseId}/videos`, videoData);
    return response.data.data!;
  }

  async updateVideo(courseId: string, videoId: string, videoData: Partial<CreateVideoRequest>): Promise<Video> {
    const response: AxiosResponse<{ success: boolean; data: Video }> = await this.api.put(`/courses/${courseId}/videos/${videoId}`, videoData);
    return response.data.data!;
  }

  async deleteVideo(courseId: string, videoId: string): Promise<void> {
    await this.api.delete(`/courses/${courseId}/videos/${videoId}`);
  }

  // Material endpoints
  async addMaterialToCourse(courseId: string, materialData: CreateMaterialRequest): Promise<Material> {
    const response: AxiosResponse<{ success: boolean; data: Material }> = await this.api.post(`/courses/${courseId}/materials`, materialData);
    return response.data.data!;
  }

  async updateMaterial(courseId: string, materialId: string, materialData: Partial<CreateMaterialRequest>): Promise<Material> {
    const response: AxiosResponse<{ success: boolean; data: Material }> = await this.api.put(`/courses/${courseId}/materials/${materialId}`, materialData);
    return response.data.data!;
  }

  async deleteMaterial(courseId: string, materialId: string): Promise<void> {
    await this.api.delete(`/courses/${courseId}/materials/${materialId}`);
  }

  // Progress endpoints
  async getCourseProgress(courseId: string): Promise<Progress> {
    const response: AxiosResponse<{ success: boolean; data: Progress }> = await this.api.get(`/courses/${courseId}/progress`);
    return response.data.data!;
  }

  async updateVideoProgress(courseId: string, videoId: string): Promise<Progress> {
    const response: AxiosResponse<{ success: boolean; data: Progress }> = await this.api.post(`/courses/${courseId}/videos/${videoId}/complete`);
    return response.data.data!;
  }

  async updateMaterialProgress(courseId: string, materialId: string): Promise<Progress> {
    const response: AxiosResponse<{ success: boolean; data: Progress }> = await this.api.post(`/courses/${courseId}/materials/${materialId}/complete`);
    return response.data.data!;
  }

  // Payment endpoints
  async createPayment(courseId: string, amount: number): Promise<Payment> {
    const response: AxiosResponse<{ success: boolean; data: Payment }> = await this.api.post('/payments', { courseId, amount });
    return response.data.data!;
  }

  async getPayments(): Promise<Payment[]> {
    const response: AxiosResponse<{ success: boolean; data: Payment[] }> = await this.api.get('/payments');
    return response.data.data || [];
  }

  // Admin payment endpoints (using admin routes as fallback)
  async getPaymentStats(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    try {
      // Try admin payment-stats endpoint first
      const response: AxiosResponse<{ success: boolean; stats: any; revenueByPlan: any[]; monthlyRevenue: any[] }> = await this.api.get('/admin/payment-stats', { params });
      return response.data;
    } catch (error) {
      console.log('Admin payment-stats failed, trying payments/stats...');
      // Fallback to payments/stats endpoint
      const response: AxiosResponse<{ success: boolean; stats: any; revenueByPlan: any[]; monthlyRevenue: any[] }> = await this.api.get('/payments/stats', { params });
      return response.data;
    }
  }

  async getRecentPayments(limit: number = 10): Promise<any> {
    try {
      // Try admin recent-payments endpoint first
      const response: AxiosResponse<{ success: boolean; payments: Payment[] }> = await this.api.get('/admin/recent-payments', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.log('Admin recent-payments failed, trying payments/recent...');
      // Fallback to payments/recent endpoint
      const response: AxiosResponse<{ success: boolean; payments: Payment[] }> = await this.api.get('/payments/recent', {
        params: { limit }
      });
      return response.data;
    }
  }

  async getAllPayments(page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    const params = { page, limit, ...filters };
    try {
      // Try admin all-payments endpoint first
      const response: AxiosResponse<{ success: boolean; payments: Payment[]; pagination: any }> = await this.api.get('/admin/all-payments', { params });
      return response.data;
    } catch (error) {
      console.log('Admin all-payments failed, trying payments/all...');
      // Fallback to payments/all endpoint
      const response: AxiosResponse<{ success: boolean; payments: Payment[]; pagination: any }> = await this.api.get('/payments/all', { params });
      return response.data;
    }
  }

  async verifyPayment(paymentId: string): Promise<Payment> {
    const response: AxiosResponse<{ success: boolean; data: Payment }> = await this.api.post(`/payments/${paymentId}/verify`);
    return response.data.data!;
  }

  // Subscription endpoints
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response: AxiosResponse<{ success: boolean; data: SubscriptionPlan[] }> = await this.api.get('/subscriptions/plans');
    return response.data.data || [];
  }

  async createSubscription(planId: string): Promise<Subscription> {
    const response: AxiosResponse<{ success: boolean; data: Subscription }> = await this.api.post('/subscriptions', { planId });
    return response.data.data!;
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    const response: AxiosResponse<{ success: boolean; data: Subscription | null }> = await this.api.get('/subscriptions/current');
    return response.data.data;
  }

  async cancelSubscription(): Promise<void> {
    await this.api.delete('/subscriptions/current');
  }


  // Admin endpoints
  async getAdminStats(): Promise<AdminStats> {
    const response: AxiosResponse<{ success: boolean; data: AdminStats }> = await this.api.get('/admin/stats');
    return response.data.data!;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response: AxiosResponse<{ success: boolean; data: SystemHealth }> = await this.api.get('/admin/health');
    return response.data.data!;
  }

  async getAdminAnalytics(timeRange?: string): Promise<AdminAnalytics> {
    const response: AxiosResponse<{ success: boolean; data: AdminAnalytics }> = await this.api.get('/admin/analytics', {
      params: timeRange ? { timeRange } : undefined,
    });
    return response.data.data!;
  }

  async getAllUsers(): Promise<User[]> {
    const response: AxiosResponse<{ success: boolean; data: User[] }> = await this.api.get('/admin/users');
    return response.data.data || [];
  }

  async updateUserRole(userId: string, role: 'student' | 'instructor' | 'admin'): Promise<User> {
    const response: AxiosResponse<{ success: boolean; data: User }> = await this.api.put(`/admin/users/${userId}/role`, { role });
    return response.data.data!;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/admin/users/${userId}`);
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const response: AxiosResponse<{ success: boolean; data: SystemSettings }> = await this.api.get('/admin/settings');
    return response.data.data!;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response: AxiosResponse<{ success: boolean; data: SystemSettings }> = await this.api.put('/admin/settings', settings);
    return response.data.data!;
  }

  async getAllCourses(): Promise<Course[]> {
    const response: AxiosResponse<{ success: boolean; data: Course[] }> = await this.api.get('/admin/courses');
    return response.data.data || [];
  }

  async moderateCourse(courseId: string, action: 'approve' | 'reject' | 'suspend'): Promise<void> {
    await this.api.put(`/admin/courses/${courseId}/moderate`, { action });
  }

  // Certificate endpoints
  async getAllCertificates(page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    const params = { page, limit, ...filters };
    const response: AxiosResponse<{ success: boolean; certificates: any[]; pagination: any }> = await this.api.get('/certificates', { params });
    return response.data;
  }

  async getCertificateStats(): Promise<any> {
    const response: AxiosResponse<{ success: boolean; stats: any }> = await this.api.get('/certificates/stats');
    return response.data;
  }

  async getEligibleStudents(courseId?: string): Promise<any> {
    const params = courseId ? { courseId } : {};
    const response: AxiosResponse<{ success: boolean; eligibleStudents: any[] }> = await this.api.get('/certificates/eligible-students', { params });
    return response.data;
  }

  async createCertificate(certificateData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; certificate: any; message: string }> = await this.api.post('/certificates', certificateData);
    return response.data;
  }

  async updateCertificateStatus(certificateId: string, status: string, certificateUrl?: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; certificate: any; message: string }> = await this.api.put(`/certificates/${certificateId}/status`, { status, certificateUrl });
    return response.data;
  }

  async sendCertificate(certificateId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; certificate: any; message: string }> = await this.api.post(`/certificates/${certificateId}/send`);
    return response.data;
  }

  async getCertificate(certificateId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; certificate: any }> = await this.api.get(`/certificates/${certificateId}`);
    return response.data;
  }

  async deleteCertificate(certificateId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/certificates/${certificateId}`);
    return response.data;
  }

  // Announcement endpoints
  async getActiveAnnouncements(): Promise<any> {
    const response: AxiosResponse<{ success: boolean; announcements: any[] }> = await this.api.get('/announcements');
    return response.data;
  }

  async getAllAnnouncements(page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    const params = { page, limit, ...filters };
    const response: AxiosResponse<{ success: boolean; announcements: any[]; pagination: any }> = await this.api.get('/announcements/all', { params });
    return response.data;
  }

  async getAnnouncementStats(): Promise<any> {
    const response: AxiosResponse<{ success: boolean; stats: any }> = await this.api.get('/announcements/stats');
    return response.data;
  }

  async getAnnouncement(announcementId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; announcement: any }> = await this.api.get(`/announcements/${announcementId}`);
    return response.data;
  }

  async createAnnouncement(announcementData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; announcement: any; message: string }> = await this.api.post('/announcements', announcementData);
    return response.data;
  }

  async updateAnnouncement(announcementId: string, announcementData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; announcement: any; message: string }> = await this.api.put(`/announcements/${announcementId}`, announcementData);
    return response.data;
  }

  async deleteAnnouncement(announcementId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/announcements/${announcementId}`);
    return response.data;
  }

  async togglePinAnnouncement(announcementId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; announcement: any; message: string }> = await this.api.put(`/announcements/${announcementId}/pin`);
    return response.data;
  }

  async toggleActiveAnnouncement(announcementId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; announcement: any; message: string }> = await this.api.put(`/announcements/${announcementId}/toggle`);
    return response.data;
  }

  async markAnnouncementAsRead(announcementId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.post(`/announcements/${announcementId}/read`);
    return response.data;
  }

  // Discussion Forum endpoints
  async getForums(category?: string, level?: string): Promise<any> {
    const params: any = {};
    if (category) params.category = category;
    if (level) params.level = level;
    const response: AxiosResponse<{ success: boolean; forums: any[] }> = await this.api.get('/forums', { params });
    return response.data;
  }

  async getAllForums(page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    // Clean filters to avoid sending empty strings which can be misinterpreted server-side
    const cleanedFilters: any = {};
    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          cleanedFilters[key] = value;
        }
      });
    }
    const params = { page, limit, ...cleanedFilters };
    const response: AxiosResponse<{ success: boolean; forums: any[]; pagination: any }> = await this.api.get('/forums/all', { params });
    return response.data;
  }

  async getForumStats(): Promise<any> {
    const response: AxiosResponse<{ success: boolean; stats: any }> = await this.api.get('/forums/stats');
    return response.data;
  }

  async getForum(forumId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any }> = await this.api.get(`/forums/${forumId}`);
    return response.data;
  }

  async createForum(forumData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any; message: string }> = await this.api.post('/forums', forumData);
    return response.data;
  }

  async updateForum(forumId: string, forumData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any; message: string }> = await this.api.put(`/forums/${forumId}`, forumData);
    return response.data;
  }

  async deleteForum(forumId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/forums/${forumId}`);
    return response.data;
  }

  async togglePinForum(forumId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any; message: string }> = await this.api.put(`/forums/${forumId}/pin`);
    return response.data;
  }

  async toggleActiveForum(forumId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any; message: string }> = await this.api.put(`/forums/${forumId}/toggle`);
    return response.data;
  }

  async subscribeToForum(forumId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any; message: string }> = await this.api.post(`/forums/${forumId}/subscribe`);
    return response.data;
  }

  async unsubscribeFromForum(forumId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; forum: any; message: string }> = await this.api.post(`/forums/${forumId}/unsubscribe`);
    return response.data;
  }

  async getForumPosts(forumId: string, page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    const params = { page, limit, ...filters };
    const response: AxiosResponse<{ success: boolean; posts: any[]; pagination: any }> = await this.api.get(`/forums/${forumId}/posts`, { params });
    return response.data;
  }

  async createForumPost(forumId: string, postData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; post: any; message: string }> = await this.api.post(`/forums/${forumId}/posts`, postData);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notifications: any[] }> = await this.api.get('/notifications');
    return response.data;
  }

  async getAllNotifications(page: number = 1, limit: number = 20, filters: any = {}): Promise<any> {
    // Clean filters to avoid sending empty strings which can be misinterpreted server-side
    const cleanedFilters: any = {};
    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          cleanedFilters[key] = value;
        }
      });
    }
    const params = { page, limit, ...cleanedFilters };
    const response: AxiosResponse<{ success: boolean; notifications: any[]; pagination: any }> = await this.api.get('/notifications/all', { params });
    return response.data;
  }

  async getNotificationStats(): Promise<any> {
    const response: AxiosResponse<{ success: boolean; stats: any }> = await this.api.get('/notifications/stats');
    return response.data;
  }

  async getNotification(notificationId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notification: any }> = await this.api.get(`/notifications/${notificationId}`);
    return response.data;
  }

  async createNotification(notificationData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notification: any; message: string }> = await this.api.post('/notifications', notificationData);
    return response.data;
  }

  async updateNotification(notificationId: string, notificationData: any): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notification: any; message: string }> = await this.api.put(`/notifications/${notificationId}`, notificationData);
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  async togglePinNotification(notificationId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notification: any; message: string }> = await this.api.put(`/notifications/${notificationId}/pin`);
    return response.data;
  }

  async toggleActiveNotification(notificationId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notification: any; message: string }> = await this.api.put(`/notifications/${notificationId}/toggle`);
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.post(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markNotificationAsClicked(notificationId: string): Promise<any> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.post(`/notifications/${notificationId}/click`);
    return response.data;
  }

  async sendNotificationToUsers(notificationData: any, userIds: string[]): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notifications: any[]; message: string }> = await this.api.post('/notifications/send-to-users', { notificationData, userIds });
    return response.data;
  }

  async sendNotificationToParents(notificationData: any, studentIds: string[]): Promise<any> {
    const response: AxiosResponse<{ success: boolean; notifications: any[]; message: string }> = await this.api.post('/notifications/send-to-parents', { notificationData, studentIds });
    return response.data;
  }

  async getNotificationTargetUsers(role?: string, courseId?: string, search?: string): Promise<any> {
    const params: any = {};
    if (role) params.role = role;
    if (courseId) params.courseId = courseId;
    if (search) params.search = search;
    const response: AxiosResponse<{ success: boolean; users: any[]; courses: any[] }> = await this.api.get('/notifications/target-users', { params });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
