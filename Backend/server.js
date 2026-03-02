const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');

console.log('🚀 Starting SRI-KO LMS Backend Service...');
console.log('📋 Environment:', process.env.NODE_ENV || 'development');

// Load environment variables with Choreo-specific configuration
// Priority: Environment variables > config files
let envFile;
if (process.env.NODE_ENV === 'production') {
  envFile = './config.production.env';
} else if (process.env.NODE_ENV === 'test') {
  envFile = './config.test.env';
} else {
  envFile = './config.env';
}
console.log('📁 Loading environment from:', envFile);
require('dotenv').config({ path: envFile });

// Debug environment variables
console.log('🔐 JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('🔐 JWT_SECRET value:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Override with explicit environment variables if set
if (process.env.PORT) {
  console.log('🔧 Using PORT from environment:', process.env.PORT);
}

console.log('🔧 Environment variables loaded:');
console.log('  - PORT:', process.env.PORT);
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('  - CORS_ORIGIN:', process.env.CORS_ORIGIN ? 'Set' : 'Not set');
console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not set');
console.log('  - SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Not set');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const joinUsRoutes = require('./routes/joinUsRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const discussionForumRoutes = require('./routes/discussionForumRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const fs = require('fs');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 5001;
const httpsFlag = (process.env.HTTPS_ENABLE || 'false');
const HTTPS_ENABLE = (httpsFlag || 'false').toLowerCase() === 'true';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting (general)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Additional security middleware
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Ensure HTTPS redirects in production
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

// Input validation middleware
app.use((req, res, next) => {
  // Basic SQL injection protection
  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)|(;|--|\/\*|\*\/)/i;

  const checkBody = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        if (checkBody(obj[key])) return true;
      } else if (typeof obj[key] === 'string' && sqlInjectionPattern.test(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (req.body && checkBody(req.body)) {
    return res.status(400).json({ success: false, message: 'Invalid input detected' });
  }

  if (req.query && checkBody(req.query)) {
    return res.status(400).json({ success: false, message: 'Invalid input detected' });
  }

  next();
});

// CORS configuration with Choreo-specific origins
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://sri-kolms-frontend.choreo.dev',
        'https://sri-kolms-api.choreo.dev',
        'https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev',
        'https://aa154534-bca8-4dd3-a52e-51387c5d6859.e1-us-east-azure.choreoapps.dev/',
        /^https:\/\/.*\.choreoapps\.dev$/,
        /^https:\/\/.*\.choreo\.dev$/,
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN
      ].filter(Boolean)
    : [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:3000',
        process.env.CORS_ORIGIN
      ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Choreo-specific routing middleware
// This handles the Choreo deployment URL structure
app.use((req, res, next) => {
  // Debug logging for all incoming requests
  console.log(`🔍 Incoming request: ${req.method} ${req.path} - Original URL: ${req.url}`);

  // Check if this is a Choreo deployment request with the old format
  if (req.path.startsWith('/choreo-apis/sri-ko-lms-platform/backend/v1')) {
    // Remove the Choreo-specific prefix and rewrite the path
    const newPath = req.path.replace('/choreo-apis/sri-ko-lms-platform/backend/v1', '');
    console.log(`🔄 Choreo route rewrite (old format): ${req.path} -> ${newPath}`);
    req.url = newPath;
    req.path = newPath;
  }

  // Log the final path that will be processed
  console.log(`📝 Final path for processing: ${req.method} ${req.path}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Choreo-specific static file serving
// Handle uploads with Choreo prefix
app.use('/choreo-apis/sri-ko-lms-platform/backend/v1/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: (process.env.NODE_ENV || 'development') === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Logging middleware
app.use(morgan('combined'));

// Database connection with enhanced logging and error handling
console.log('🔌 Connecting to database...');
console.log('🔧 MongoDB URI configured:', process.env.MONGODB_URI ? 'Yes' : 'No');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

if (process.env.SKIP_DB === 'true') {
  console.log('⚠️ Skipping MongoDB connection (SKIP_DB=true)');
} else {
  // Enhanced mongoose options for maximum stability and auto-reconnect
  const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    maxPoolSize: 10, // Maximum number of connections in the connection pool
    minPoolSize: 1, // Minimum number of connections in the connection pool
    bufferCommands: false, // Disable mongoose buffering
    connectTimeoutMS: 30000, // Connection timeout
    heartbeatFrequencyMS: 10000, // Heartbeat frequency
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true, // Retry write operations
    w: 'majority' // Write concern
  };

  mongoose
    .connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => {
      console.log('✅ MongoDB Atlas connected successfully');
      console.log('🔧 Connection state:', mongoose.connection.readyState);

      // Test database connection
      const User = require('./models/User');
      User.countDocuments().then(count => {
        console.log(`📊 Total users in database: ${count}`);
      }).catch(err => {
        console.log('⚠️ Could not count users:', err.message);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
      console.error('❌ Error details:', {
        name: err.name,
        message: err.message,
        code: err.code
      });

      // In production, try to continue without database for basic functionality
      console.log('⚠️ Continuing without database connection - some features may not work');
    });

  // Comprehensive MongoDB connection event listeners for auto-reconnect
  const db = mongoose.connection;

  db.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
    console.log('🔧 Connection state:', mongoose.connection.readyState);
  });

  db.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
    console.error('❌ Error details:', {
      name: err.name,
      message: err.message,
      code: err.code
    });
  });

  db.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
        .then(() => {
          console.log('✅ MongoDB reconnected successfully');
        })
        .catch(err => {
          console.error('❌ MongoDB reconnection attempt failed:', err.message);
        });
    }, 5000); // retry after 5 seconds
  });

  db.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });

  db.on('close', () => {
    console.warn('⚠️ MongoDB connection closed');
  });

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination');
    process.exit(0);
  });

  // Keep MongoDB connection alive with periodic ping
  // This prevents idle connection drops on platforms like AWS or Choreo
  setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        console.log('🏓 MongoDB ping successful - connection alive');
      } catch (err) {
        console.warn('⚠️ MongoDB ping failed:', err.message);
        // If ping fails, try to reconnect
        if (mongoose.connection.readyState !== 1) {
          console.log('🔄 Attempting to reconnect after ping failure...');
          try {
            await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
            console.log('✅ MongoDB reconnected after ping failure');
          } catch (reconnectErr) {
            console.error('❌ MongoDB reconnection after ping failure failed:', reconnectErr.message);
          }
        }
      }
    } else {
      console.log('⚠️ MongoDB connection not ready, attempting to reconnect...');
      try {
        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log('✅ MongoDB reconnected successfully');
      } catch (err) {
        console.error('❌ MongoDB reconnection attempt failed:', err.message);
      }
    }
  }, 5 * 60 * 1000); // Ping every 5 minutes
}

// Health check endpoints with detailed status
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'OK',
    message: 'SRI-KO LMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    choreo: 'Enabled',
    database: {
      status: dbStatus,
      state: dbState,
      uri: process.env.MONGODB_URI ? 'Configured' : 'Not configured'
    },
    environment_vars: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PORT: process.env.PORT || 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set'
    }
  });
});

// Test route to verify basic routing works
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API routing is working correctly',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Choreo-specific test route
app.get('/choreo-apis/sri-ko-lms-platform/backend/v1/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Choreo API routing is working correctly',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    choreo: true
  });
});

// Admin test route for Choreo
app.get('/choreo-apis/sri-ko-lms-platform/backend/v1/api/admin/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Choreo Admin API routing is working correctly',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    choreo: true,
    admin: true
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    message: 'SRI-KO LMS server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: dbStatus,
    choreo: 'Enabled',
    features: {
      subscriptions: 'Available',
      payments: 'Available',
      courseManagement: 'Available',
      userManagement: 'Available'
    },
    database: {
      status: dbStatus,
      state: dbState,
      uri: process.env.MONGODB_URI ? 'Configured' : 'Not configured'
    },
    environment_vars: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PORT: process.env.PORT || 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set'
    }
  });
});

// Choreo-specific health check endpoints
app.get('/choreo-apis/sri-ko-lms-platform/backend/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SRI-KO LMS API is running (Choreo)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    choreo: 'Enabled'
  });
});

app.get('/choreo-apis/sri-ko-lms-platform/backend/v1/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SRI-KO LMS server is running (Choreo)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: process.env.MONGODB_URI ? 'Connected' : 'Not Connected',
    choreo: 'Enabled',
    features: {
      subscriptions: 'Available',
      payments: 'Available',
      courseManagement: 'Available',
      userManagement: 'Available'
    }
  });
});

// Enhanced database availability middleware with auto-reconnect
const checkDatabase = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log(`⚠️ Database disconnected for ${req.method} ${req.path}. Attempting to reconnect...`);

    try {
      // Attempt to reconnect with enhanced options
      const mongooseOptions = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
        bufferCommands: false,
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        w: 'majority'
      };

      await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
      console.log('✅ Database reconnected successfully');
      return next();
    } catch (err) {
      console.error('❌ Database reconnection failed:', err.message);
      return res.status(503).json({
        success: false,
        message: 'Database service temporarily unavailable. Please try again shortly.',
        error: 'DATABASE_CONNECTION_ERROR',
        retryAfter: 5 // seconds
      });
    }
  }
  next();
};

// Routes with audit logging and enhanced security
app.use('/api/auth', (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log(`✅ Auth Success: ${req.method} ${req.path} - Status: ${res.statusCode}`);
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.log(`❌ Auth Failure: ${req.method} ${req.path} - Status: ${res.statusCode}`);
    }
  });
  next();
}, checkDatabase, authRoutes);

// Mount user routes with debugging
app.use('/api/users', (req, res, next) => {
  console.log(`👤 User route accessed: ${req.method} ${req.path}`);
  next();
}, checkDatabase, userRoutes);
app.use('/api/courses', checkDatabase, courseRoutes);
app.use('/api/join-us', checkDatabase, joinUsRoutes);

// Admin routes with enhanced security and audit logging
app.use('/api/admin', (req, res, next) => {
  console.log(`🔐 Admin route accessed: ${req.method} ${req.path} - Full URL: ${req.url}`);
  res.on('finish', () => {
    if (req.method !== 'GET') {
      console.log(`🔐 Admin Action: ${req.method} ${req.path} - Status: ${res.statusCode}${req.user ? ` - User: ${req.user.name || req.user.email}` : ''}`);
    } else {
      console.log(`👁️ Admin View: ${req.method} ${req.path} - Status: ${res.statusCode}${req.user ? ` - User: ${req.user.name || req.user.email}` : ''}`);
    }
  });
  next();
}, checkDatabase, adminRoutes);

// Additional Choreo-specific admin route mounting (fallback)
app.use('/choreo-apis/sri-ko-lms-platform/backend/v1/api/admin', (req, res, next) => {
  console.log(`🔐 Choreo Admin route accessed: ${req.method} ${req.path} - Full URL: ${req.url}`);
  res.on('finish', () => {
    if (req.method !== 'GET') {
      console.log(`🔐 Choreo Admin Action: ${req.method} ${req.path} - Status: ${res.statusCode}${req.user ? ` - User: ${req.user.name || req.user.email}` : ''}`);
    } else {
      console.log(`👁️ Choreo Admin View: ${req.method} ${req.path} - Status: ${res.statusCode}${req.user ? ` - User: ${req.user.name || req.user.email}` : ''}`);
    }
  });
  next();
}, checkDatabase, adminRoutes);

app.use('/api/subscriptions', checkDatabase, subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', checkDatabase, certificateRoutes);
app.use('/api/announcements', checkDatabase, announcementRoutes);
app.use('/api/forums', checkDatabase, discussionForumRoutes);
app.use('/api/notifications', checkDatabase, notificationRoutes);
app.use('/api/admin/settings', checkDatabase, settingsRoutes);

// Static assets in production
if ((process.env.NODE_ENV || 'development') === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../Frontend', 'dist', 'index.html'))
  );
}

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server (HTTP or HTTPS) with captured server instance
let server;

// Start server unless explicitly disabled
// Allow test environment to start server for integration tests
if (process.env.SKIP_SERVER !== 'true') {
  console.log('🚀 Starting server...');
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔧 Port:', PORT);
  if (HTTPS_ENABLE && SSL_KEY_PATH && SSL_CERT_PATH && fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
    const key = fs.readFileSync(SSL_KEY_PATH);
    const cert = fs.readFileSync(SSL_CERT_PATH);
    server = https.createServer({ key, cert }, app).listen(PORT, () => {
      console.log('✅ Server successfully started!');
      console.log(`🔐 HTTPS server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: https://localhost:${PORT}/api/health`);
      console.log(`📡 API endpoints available at: https://localhost:${PORT}/api/`);
    });
  } else {
    if (HTTPS_ENABLE) {
      console.log('⚠️ HTTPS requested but SSL_KEY_PATH/SSL_CERT_PATH not found. Falling back to HTTP.');
    }
    server = app.listen(PORT, () => {
      console.log('✅ Server successfully started!');
      console.log(`🚀 HTTP server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📡 API endpoints available at: http://localhost:${PORT}/api/`);
    });
  }

  // Server error handling
  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please free the port and retry.`);
      process.exit(1);
    }
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`🛑 ${signal} received, shutting down gracefully`);
    if (server && server.close) {
      server.close(() => {
        console.log('✅ Server closed');
        mongoose.connection.close();
        process.exit(0);
      });
    } else {
      mongoose.connection.close();
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} else {
  console.log('⚠️ Server startup skipped (SKIP_SERVER=true)');
}

module.exports = app;
