const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// ===============================================
// @route   POST /api/feedback/generate
// @desc    Generate full resume feedback using AI and save it
// @access  Public (add auth if needed)
// ===============================================
router.post('/generate', feedbackController.generateFeedback);

// Submit user feedback after download (no auth required to allow anonymous feedback)
router.post('/submit', feedbackController.submitFeedback);

// Get all feedback (admin only)
router.get('/all', authenticateToken, isAdmin, feedbackController.getAllFeedback);

// Get feedback statistics (admin only)
router.get('/stats', authenticateToken, isAdmin, feedbackController.getFeedbackStats);

// Get feedback for a specific resume
router.get('/resume/:resumeId', authenticateToken, feedbackController.getFeedbackByResume);

// Export the router
module.exports = router;
