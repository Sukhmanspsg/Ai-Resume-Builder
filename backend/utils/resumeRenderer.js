// const { generateHTMLFromJSON } = require('../utils/resumeRenderer');
const injectTemplate = require('../utils/injectTemplate'); // 👈 import added

const { generateHTMLFromJSON } = require('../utils/resumeRenderer'); // Utility for fallback rendering

// Optional: consider importing this if you write your own injectTemplate function
// const { injectTemplate } = require('../utils/injectTemplate');

exports.resumeRenderer = async (req, res) => {
  const templateId = req.params.id;
  const resumeId = req.query.resumeId;

  try {
    // ================================
    // Step 1: Load Template by ID
    // ================================
    const template = await new Promise((resolve, reject) => {
      templateModel.getTemplateById(templateId, (err, result) => {
        if (err) return reject(err);
        resolve(result[0] || null);
      });
    });

    if (!template) return res.status(404).json({ message: 'Template not found' });

    // ================================
    // Step 2: Load Latest Feedback or Raw Resume
    // ================================
    const feedback = await new Promise((resolve, reject) => {
      Feedback.getLatestByResumeId(resumeId, (err, result) => {
        if (err) return reject(err);
        resolve(result || null);
      });
    });

    let feedbackJson;

    if (feedback?.message) {
      // Use AI-enhanced resume data if available
      feedbackJson = JSON.parse(feedback.message);
    } else {
      // Fall back to original resume
      const resumeModel = require('../models/resumeModel');
      const resume = await new Promise((resolve, reject) => {
        resumeModel.getResumeById(resumeId, (err, result) => {
          if (err) return reject(err);
          resolve(result[0] || null);
        });
      });

      if (!resume) return res.status(404).json({ message: 'Resume not found' });

      feedbackJson = JSON.parse(resume.content);
    }

    // ================================
    // Step 3: Decide Rendering Method
    // If template is too basic, fall back to full JSON renderer
    // ================================
    const requiredTags = ['{{name}}', '{{title}}', '{{summary}}', '{{email}}', '{{contact}}', '{{linkedin}}'];

    const isBasic = requiredTags.every(tag => !template.html_code.includes(tag));

    // Either use full JSON rendering or inject placeholders
    const renderedHTML = isBasic
      ? generateHTMLFromJSON(feedbackJson)
      : injectTemplate(template.html_code, feedbackJson); // You should define injectTemplate()

    // ================================
    // Step 4: Return Rendered HTML
    // ================================
    return res.status(200).send(renderedHTML);

  } catch (err) {
    console.error('❌ renderResumeTemplate error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
