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

const fs = require('fs');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 5000;
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
  max: 100, // limit each IP to 100 requests per windowMs
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
  
  // Check if this is a Choreo deployment request
  if (req.path.startsWith('/choreo-apis/sri-ko-lms-platform/backend/v1/api')) {
    // Remove the Choreo-specific prefix and rewrite the path
    const newPath = req.path.replace('/choreo-apis/sri-ko-lms-platform/backend/v1', '');
    console.log(`🔄 Choreo route rewrite: ${req.path} -> ${newPath}`);
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

// Database connection with enhanced logging
console.log('🔌 Connecting to database...');
if (process.env.SKIP_DB === 'true') {
  console.log('⚠️ Skipping MongoDB connection (SKIP_DB=true)');
} else {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB Atlas connected successfully');
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
      // Only exit in production, allow CI to continue
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.log('⚠️ Continuing without database connection in non-production environment');
      }
    });
}

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SRI-KO LMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    choreo: 'Enabled'
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

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SRI-KO LMS server is running',
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
}, authRoutes);

// Mount user routes with debugging
app.use('/api/users', (req, res, next) => {
  console.log(`👤 User route accessed: ${req.method} ${req.path}`);
  next();
}, userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/join-us', joinUsRoutes);

// Admin routes with enhanced security and audit logging
app.use('/api/admin', (req, res, next) => {
  res.on('finish', () => {
    if (req.method !== 'GET') {
      console.log(`🔐 Admin Action: ${req.method} ${req.path} - Status: ${res.statusCode}${req.user ? ` - User: ${req.user.name || req.user.email}` : ''}`);
    } else {
      console.log(`👁️ Admin View: ${req.method} ${req.path} - Status: ${res.statusCode}${req.user ? ` - User: ${req.user.name || req.user.email}` : ''}`);
    }
  });
  next();
}, adminRoutes);

app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// Static assets in production
if ((process.env.NODE_ENV || 'development') === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../Frontend', 'dist', 'index.html'))
  );
}

// Error handling middleware
app.use((err, req, res, next) => {
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