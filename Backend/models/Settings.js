const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Site Information
    siteName: {
      type: String,
      default: 'SRI-KO LMS',
      required: true,
    },
    siteDescription: {
      type: String,
      default: 'Korean Language Learning Management System',
    },
    siteLogo: {
      type: String,
      default: '',
    },
    siteFavicon: {
      type: String,
      default: '',
    },
    
    // Contact Information
    contactEmail: {
      type: String,
      default: 'contact@sri-ko-lms.com',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    contactAddress: {
      type: String,
      default: '',
    },
    
    // Social Media Links
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    
    // Email Settings
    emailSettings: {
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: '' },
      smtpPassword: { type: String, default: '' },
      fromEmail: { type: String, default: 'noreply@sri-ko-lms.com' },
      fromName: { type: String, default: 'SRI-KO LMS' },
    },
    
    // Course Settings
    courseSettings: {
      maxCourseDuration: { type: Number, default: 120 }, // in minutes
      minCourseDuration: { type: Number, default: 5 }, // in minutes
      maxCoursePrice: { type: Number, default: 1000 },
      minCoursePrice: { type: Number, default: 0 },
      allowFreeCourses: { type: Boolean, default: true },
      requireCourseApproval: { type: Boolean, default: false },
      maxEnrolledStudents: { type: Number, default: 100 },
    },
    
    // User Settings
    userSettings: {
      allowRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      allowInstructorRegistration: { type: Boolean, default: true },
      maxUserUploadSize: { type: Number, default: 10 }, // in MB
      userSessionTimeout: { type: Number, default: 24 }, // in hours
    },
    
    // Payment Settings
    paymentSettings: {
      currency: { type: String, default: 'USD' },
      stripePublicKey: { type: String, default: '' },
      stripeSecretKey: { type: String, default: '' },
      paypalClientId: { type: String, default: '' },
      paypalClientSecret: { type: String, default: '' },
      enablePayments: { type: Boolean, default: false },
    },
    
    // Notification Settings
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      notificationFrequency: { 
        type: String, 
        enum: ['immediate', 'daily', 'weekly'],
        default: 'immediate'
      },
    },
    
    // Security Settings
    securitySettings: {
      enableTwoFactor: { type: Boolean, default: false },
      passwordMinLength: { type: Number, default: 8 },
      passwordRequireSpecialChars: { type: Boolean, default: true },
      sessionTimeout: { type: Number, default: 24 }, // in hours
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 30 }, // in minutes
    },
    
    // Maintenance Settings
    maintenanceSettings: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { 
        type: String, 
        default: 'We are currently performing maintenance. Please check back later.' 
      },
      scheduledMaintenanceStart: { type: Date },
      scheduledMaintenanceEnd: { type: Date },
    },
    
    // Analytics Settings
    analyticsSettings: {
      googleAnalyticsId: { type: String, default: '' },
      facebookPixelId: { type: String, default: '' },
      enableAnalytics: { type: Boolean, default: false },
      trackUserBehavior: { type: Boolean, default: true },
    },
    
    // File Upload Settings
    uploadSettings: {
      maxFileSize: { type: Number, default: 50 }, // in MB
      allowedImageTypes: { 
        type: [String], 
        default: ['jpg', 'jpeg', 'png', 'gif', 'webp'] 
      },
      allowedVideoTypes: { 
        type: [String], 
        default: ['mp4', 'avi', 'mov', 'wmv', 'flv'] 
      },
      allowedDocumentTypes: { 
        type: [String], 
        default: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'] 
      },
    },
    
    // Theme Settings
    themeSettings: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#8B5CF6' },
      accentColor: { type: String, default: '#10B981' },
      darkMode: { type: Boolean, default: false },
      customCSS: { type: String, default: '' },
    },
    
    // Language Settings
    languageSettings: {
      defaultLanguage: { type: String, default: 'en' },
      supportedLanguages: { 
        type: [String], 
        default: ['en', 'ko', 'ja', 'zh'] 
      },
      enableRTL: { type: Boolean, default: false },
    },
    
    // Backup Settings
    backupSettings: {
      autoBackup: { type: Boolean, default: false },
      backupFrequency: { 
        type: String, 
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      backupRetention: { type: Number, default: 30 }, // in days
      backupLocation: { type: String, default: 'local' },
    },
    
    // System Settings
    systemSettings: {
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      timeFormat: { type: String, default: '12' }, // 12 or 24
      enableDebugMode: { type: Boolean, default: false },
      logLevel: { 
        type: String, 
        enum: ['error', 'warn', 'info', 'debug'],
        default: 'info'
      },
    },
    
    // Last updated by
    lastUpdatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);

