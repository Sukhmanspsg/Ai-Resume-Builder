const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
// const { verifyToken } = require('../middleware/authMiddleware');

console.log("Loaded resumeController:", resumeController);

// ✅ Upload a resume file (PDF/DOCX)
router.post('/upload-file', resumeController.uploadResumeFile);

// ✅ Create a new resume
router.post('/', resumeController.createResume);

// ✅ Get all resumes for a specific user
router.get('/user/:userId', resumeController.getUserResumes);

// ✅ Get a specific resume by its ID
router.get('/:id', resumeController.getResumeById);

// ✅ Update a resume
router.put('/:id', resumeController.updateResume);

// ✅ Delete a resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
