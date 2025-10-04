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

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<{ success: boolean; data: Notification[] }> = await this.api.get('/notifications');
    return response.data.data || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.put(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put('/notifications/read-all');
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
}

export const apiService = new ApiService();
export default apiService;
