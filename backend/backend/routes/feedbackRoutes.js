const express = require('express');
const router = express.Router();

// Import feedback controller
const feedbackController = require('../controllers/feedbackController');

// ===============================================
// @route   POST /api/feedback/generate
// @desc    Generate full resume feedback using AI and save it
// @access  Public (add auth if needed)
// ===============================================
router.post('/generate', feedbackController.generateFeedback);

// Export the router
module.exports = router;
