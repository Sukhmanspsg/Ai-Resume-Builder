const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { verifyToken } = require('../middleware/authMiddleware');

console.log("Loaded resumeController:", resumeController);

// ===============================================
// @route   POST /api/resumes
// @desc    Create a new resume
// @access  Private
// ===============================================
router.post('/', verifyToken, resumeController.createResume);

// ===============================================
// @route   GET /api/resumes/user/:userId
// @desc    Get all resumes for a user
// @access  Private
// ===============================================
router.get('/user/:userId', verifyToken, resumeController.getUserResumes);

// ===============================================
// @route   GET /api/resumes/:id
// @desc    Get a specific resume
// @access  Private
// ===============================================
router.get('/:id', verifyToken, resumeController.getResumeById);

// ===============================================
// @route   PUT /api/resumes/:id
// @desc    Update a resume
// @access  Private
// ===============================================
router.put('/:id', verifyToken, resumeController.updateResume);

// ===============================================
// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
// @access  Private
// ===============================================
router.delete('/:id', verifyToken, resumeController.deleteResume);

// ===============================================
// @route   POST /api/resumes/upload
// @desc    Upload and parse a resume file
// @access  Private
// ===============================================
router.post('/upload', verifyToken, resumeController.uploadResumeFile);

module.exports = router;
