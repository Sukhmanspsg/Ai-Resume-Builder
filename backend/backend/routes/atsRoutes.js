const express = require('express');
const router = express.Router();

// Import ATS controller function
const { getATSScore } = require('../controllers/atsController');

// ===============================================
// @route   POST /api/ats/ats-score
// @desc    Evaluate resume content and return ATS score (0-100)
// @access  Public (protect with auth if needed)
// ===============================================
router.post('/ats-score', getATSScore);

// ✅ Make sure you're exporting the router correctly
module.exports = router;
