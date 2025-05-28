// backend/routes/aiSuggestionsRoutes.js
const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getSuggestions,
  applySuggestions
} = require('../controllers/aiSuggestionsController');

// ===============================================
// ROUTE: POST /api/ai/suggestions
// PURPOSE: Get AI-based suggestions for improving a resume
// ===============================================
router.post('/suggestions', getSuggestions);

// ===============================================
// ROUTE: POST /api/ai/apply-suggestions
// PURPOSE: Apply those suggestions to the resume content
// ===============================================
router.post('/apply-suggestions', applySuggestions);

// Export the router to be used in your app
module.exports = router;
