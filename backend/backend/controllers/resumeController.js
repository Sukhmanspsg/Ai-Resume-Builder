const resumeModel = require('../models/resumeModel.js');

exports.createResume = (req, res) => {
  console.log("➡️ Reached createResume route");
    const { user_id, title, content } = req.body;
    const template_id = req.body.template_id || 1; 

  
    // Stringify the JSON content
    const stringifiedContent = JSON.stringify(content);
  
    resumeModel.createResume(user_id, template_id, title, stringifiedContent, (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ message: 'Resume created', resumeId: result.insertId });
    });
  };
  

exports.getUserResumes = (req, res) => {
  const userId = req.params.userId;
  resumeModel.getUserResumes(userId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

exports.getResumeById = (req, res) => {
  const resumeId = req.params.id;
  resumeModel.getResumeById(resumeId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Resume not found' });
    res.status(200).json(results[0]);
  });
};

exports.updateResume = (req, res) => {
    const resumeId = req.params.id;
    const { template_id, title, content } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }
  
    const safeTemplateId = template_id || 1;
    const stringifiedContent = JSON.stringify(content);
  
    resumeModel.updateResume(resumeId, safeTemplateId, title, stringifiedContent, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.status(200).json({ message: 'Resume updated successfully' });
    });
  };
  

exports.deleteResume = (req, res) => {
  const resumeId = req.params.id;
  resumeModel.deleteResume(resumeId, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json({ message: 'Resume deleted' });
  });
};
