const resumeModel = require('../models/resumeModel.js');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// CREATE A NEW RESUME
const createResume = (req, res) => {
  console.log("➡️ Reached createResume route");

  const { title, content } = req.body;
  const user_id = req.user.id; // Get user_id from JWT token
  const template_id = req.body.template_id || 1;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const stringifiedContent = JSON.stringify(content);

  resumeModel.createResume(user_id, template_id, title, stringifiedContent, (err, result) => {
    if (err) {
      console.error('Database error in createResume:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({ message: 'Resume created', resumeId: result.insertId });
  });
};

// GET ALL RESUMES
const getUserResumes = (req, res) => {
  const userId = req.params.userId;

  resumeModel.getUserResumes(userId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json(results);
  });
};

// GET RESUME BY ID
const getResumeById = (req, res) => {
  const resumeId = req.params.id;

  resumeModel.getResumeById(resumeId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) return res.status(404).json({ message: 'Resume not found' });

    res.status(200).json(results[0]);
  });
};

// UPDATE RESUME
const updateResume = (req, res) => {
  const resumeId = req.params.id;
  const { template_id, title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const safeTemplateId = template_id || 1;
  const stringifiedContent = JSON.stringify(content);

  resumeModel.updateResume(resumeId, safeTemplateId, title, stringifiedContent, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Resume updated successfully' });
  });
};

// DELETE RESUME
const deleteResume = (req, res) => {
  const resumeId = req.params.id;

  resumeModel.deleteResume(resumeId, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Resume deleted' });
  });
};

// UPLOAD RESUME FILE
const uploadResumeFile = [
  upload.single('resumeFile'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    try {
      let extractedText = '';

      if (fileExt === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);
        extractedText = parsed.text;
      } else if (fileExt === '.docx') {
        const data = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: data });
        extractedText = result.value;
      } else {
        return res.status(400).json({ message: 'Unsupported file format' });
      }

      fs.unlinkSync(filePath);
      res.status(200).json({ extractedText });
    } catch (err) {
      console.error('Error extracting file content:', err);
      res.status(500).json({ message: 'Failed to extract resume content' });
    }
  }
];

// ✅ Final export
module.exports = {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  uploadResumeFile
};
