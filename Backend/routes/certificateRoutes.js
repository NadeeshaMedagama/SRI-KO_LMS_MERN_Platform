const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all certificates with pagination and filters
// @route   GET /api/certificates
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status,
      course: req.query.course,
      student: req.query.student,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await Certificate.getAllCertificates(page, limit, filters);

    res.json({
      success: true,
      certificates: result.certificates,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get certificate statistics
// @route   GET /api/certificates/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Certificate.getCertificateStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get students eligible for certificates (completed courses)
// @route   GET /api/certificates/eligible-students
// @access  Private/Admin
router.get('/eligible-students', protect, authorize('admin'), async (req, res) => {
  try {
    const courseId = req.query.courseId;

    // Get all completed progress records
    const completedProgress = await Progress.find({ 
      status: 'completed',
      ...(courseId && { course: courseId })
    })
    .populate('user', 'name email')
    .populate('course', 'title description')
    .sort({ completedAt: -1 });

    // Filter out students who already have certificates for these courses
    const eligibleStudents = [];
    
    for (const progress of completedProgress) {
      const existingCertificate = await Certificate.findOne({
        student: progress.user._id,
        course: progress.course._id
      });

      if (!existingCertificate) {
        eligibleStudents.push({
          student: progress.user,
          course: progress.course,
          completedAt: progress.completedAt,
          progressId: progress._id
        });
      }
    }

    res.json({
      success: true,
      eligibleStudents
    });
  } catch (error) {
    console.error('Error fetching eligible students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a new certificate
// @route   POST /api/certificates
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId, courseId, notes } = req.body;

    // Validate required fields
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student has completed the course
    const progress = await Progress.findOne({
      user: studentId,
      course: courseId,
      status: 'completed'
    });

    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'Student has not completed this course'
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: studentId,
      course: courseId
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this student and course'
      });
    }

    // Create certificate
    const certificate = new Certificate({
      student: studentId,
      course: courseId,
      studentName: student.name,
      courseName: course.title,
      completionDate: progress.completedAt,
      issuedBy: req.user._id,
      notes: notes || ''
    });

    await certificate.save();

    // Populate the certificate with related data
    await certificate.populate([
      { path: 'student', select: 'name email' },
      { path: 'course', select: 'title description' },
      { path: 'issuedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      certificate
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update certificate status
// @route   PUT /api/certificates/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, certificateUrl } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'issued', 'sent', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = status;
    if (certificateUrl) {
      certificate.certificateUrl = certificateUrl;
    }

    // Update email sent status if status is 'sent'
    if (status === 'sent') {
      certificate.emailSent = true;
      certificate.emailSentDate = new Date();
    }

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate status updated successfully',
      certificate
    });
  } catch (error) {
    console.error('Error updating certificate status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Send certificate to student via email
// @route   POST /api/certificates/:id/send
// @access  Private/Admin
router.post('/:id/send', protect, authorize('admin'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('course', 'title description')
      .populate('issuedBy', 'name email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Update certificate status to 'sent'
    certificate.status = 'sent';
    certificate.emailSent = true;
    certificate.emailSentDate = new Date();
    await certificate.save();

    // TODO: Implement actual email sending logic here
    // For now, we'll just simulate the email sending
    console.log(`Certificate ${certificate.certificateNumber} sent to ${certificate.student.email}`);

    res.json({
      success: true,
      message: 'Certificate sent successfully',
      certificate
    });
  } catch (error) {
    console.error('Error sending certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('course', 'title description')
      .populate('issuedBy', 'name email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    await Certificate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
