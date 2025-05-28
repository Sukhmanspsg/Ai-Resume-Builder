const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

// Create a new resume
router.post('/', resumeController.createResume);

// Get all resumes for a specific user
router.get('/user/:userId', resumeController.getUserResumes);

// Get a specific resume by its ID
router.get('/:id', resumeController.getResumeById);

// Update a resume
router.put('/:id', resumeController.updateResume);

// Delete a resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
