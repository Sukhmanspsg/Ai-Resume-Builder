const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// ===============================================
// @route   GET /api/templates
// @desc    Get all resume templates
// @access  Public
// ===============================================
router.get('/', templateController.getAllTemplates);

// ===============================================
// @route   GET /api/templates/:id
// @desc    Get a specific template by ID
// @access  Public
// ===============================================
router.get('/:id', templateController.getTemplateById);

// ===============================================
// @route   POST /api/templates
// @desc    Create a new resume template
// @access  Admin (ideally)
// ===============================================
router.post('/', templateController.createTemplate);

// ===============================================
// @route   PUT /api/templates/:id
// @desc    Update an existing template
// @access  Admin
// ===============================================
router.put('/:id', templateController.updateTemplate);

// ===============================================
// @route   DELETE /api/templates/:id
// @desc    Delete a template
// @access  Admin
// ===============================================
router.delete('/:id', templateController.deleteTemplate);

// ===============================================
// @route   GET /api/templates/render/:id?resumeId=xx
// @desc    Render resume with data into selected template
// @access  Public
// ===============================================
router.get('/render/:id', templateController.renderResumeTemplate);

// ===============================================
// @route   POST /api/templates/generate-with-ai
// @desc    Generate a resume template using AI (Groq)
// @access  Admin/Editor
// ===============================================
router.post('/generate-with-ai', templateController.generateTemplateWithAI);

// ===============================================
// @TODO: Enable when implemented
// router.post('/generate-cover-letter', templateController.generateCoverLetter);

module.exports = router;
