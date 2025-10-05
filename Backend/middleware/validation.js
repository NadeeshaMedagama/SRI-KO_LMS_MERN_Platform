const { body, validationResult } = require('express-validator');

// Custom validation middleware
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User validation rules
exports.validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),

  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
];

exports.validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password').notEmpty().withMessage('Password is required'),
];

exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot be more than 20 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters'),

  body('website')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Website URL cannot be more than 200 characters'),

  body('socialLinks.linkedin')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('LinkedIn URL cannot be more than 200 characters'),

  body('socialLinks.twitter')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Twitter URL cannot be more than 200 characters'),

  body('socialLinks.github')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('GitHub URL cannot be more than 200 characters'),

  body('avatar')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Avatar URL cannot be more than 500 characters'),
];

// Join Us form validation rules
exports.validateJoinUsSubmission = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('age')
    .optional()
    .isInt({ min: 16, max: 80 })
    .withMessage('Age must be between 16 and 80'),

  body('currentLevel')
    .optional()
    .isIn(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced', 'Native Level'])
    .withMessage('Invalid Korean language level'),

  body('preferredTime')
    .optional()
    .isIn([
      'Morning (9:00 AM - 12:00 PM)',
      'Afternoon (1:00 PM - 4:00 PM)',
      'Evening (6:00 PM - 9:00 PM)',
      'Weekend Classes',
      'Flexible Schedule'
    ])
    .withMessage('Invalid preferred time option'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('interests.*')
    .optional()
    .isIn([
      'Korean Language Basics',
      'Business Korean',
      'Korean Culture',
      'K-Pop & K-Drama',
      'Korean Cuisine',
      'Travel Korean',
      'Academic Korean',
      'Korean Literature'
    ])
    .withMessage('Invalid interest option'),

  body('hearAboutUs')
    .optional()
    .isIn(['social-media', 'website', 'referral', 'advertisement', 'search-engine', 'other'])
    .withMessage('Invalid "how did you hear about us" option'),

  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),

  exports.handleValidationErrors
];

// Course validation rules
exports.validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Course title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('category')
    .isIn([
      'programming',
      'design',
      'business',
      'marketing',
      'lifestyle',
      'other',
    ])
    .withMessage('Invalid category'),

  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level'),

  body('duration')
    .isInt({ min: 1, max: 52 })
    .withMessage('Duration must be between 1 and 52 weeks'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
];

exports.validateCurriculum = [
  body('curriculum')
    .isArray({ min: 1 })
    .withMessage('Curriculum must have at least one week'),

  body('curriculum.*.week')
    .isInt({ min: 1 })
    .withMessage('Week number must be a positive integer'),

  body('curriculum.*.title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Week title must be between 3 and 100 characters'),

  body('curriculum.*.lessons')
    .isArray({ min: 1 })
    .withMessage('Each week must have at least one lesson'),

  body('curriculum.*.lessons.*.title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Lesson title must be between 3 and 100 characters'),
];

// Review validation rules
exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot be more than 500 characters'),
];
