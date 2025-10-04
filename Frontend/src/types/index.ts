// LMS-specific TypeScript interfaces

// User and Authentication
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
}

// Course related interfaces
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: User;
  price: number;
  duration: number; // in hours
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string;
  videos: Video[];
  materials: Material[];
  enrolledStudents: string[];
  rating: number;
  reviews: Review[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
}

export interface Material {
  _id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'zip';
  url: string;
  size: number; // in bytes
}

export interface Review {
  _id: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
}

// Progress and Enrollment
export interface Progress {
  _id: string;
  user: string;
  course: string;
  completedVideos: string[];
  completedMaterials: string[];
  progressPercentage: number;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  user: string;
  course: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
}

// Payment and Subscription
export interface Payment {
  _id: string;
  user: string;
  course?: string;
  subscription?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  user: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  maxCourses: number;
  isPopular: boolean;
}

// Notification
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// Admin interfaces
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  topCourses: Course[];
  recentUsers: User[];
}

export interface AdminAnalytics {
  userGrowth: { month: string; count: number }[];
  coursePopularity: { course: string; enrollments: number }[];
  revenueTrend: { month: string; revenue: number }[];
  userEngagement: { date: string; activeUsers: number }[];
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: 'connected' | 'disconnected';
  storage: { used: number; total: number };
  uptime: number;
  lastBackup: string;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileSize: number;
  supportedFormats: string[];
  emailSettings: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Request interfaces
export interface CreateCourseRequest {
  title: string;
  description: string;
  price: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  isPublished?: boolean;
}

export interface CreateVideoRequest {
  title: string;
  description: string;
  url: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

export interface CreateMaterialRequest {
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'zip';
  url: string;
  size: number;
}
