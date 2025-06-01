// Import required dependencies
const injectTemplate = require('../utils/injectTemplate');

// Function to generate HTML from JSON
function generateHTMLFromJSON(json) {
  // Basic HTML generation from JSON structure
  let html = `
    <div class="resume">
      <h1>${json.name || ''}</h1>
      <h2>${json.title || ''}</h2>
      <p>${json.summary || ''}</p>
      
      <div class="contact">
        ${json.email ? `<p>Email: ${json.email}</p>` : ''}
        ${json.phone ? `<p>Phone: ${json.phone}</p>` : ''}
        ${json.linkedin ? `<p>LinkedIn: ${json.linkedin}</p>` : ''}
      </div>

      ${json.experience ? `
        <div class="experience">
          <h3>Experience</h3>
          ${json.experience.map(exp => `
            <div class="job">
              <h4>${exp.title || ''}</h4>
              <p>${exp.company || ''} (${exp.dates || ''})</p>
              <p>${exp.description || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${json.education ? `
        <div class="education">
          <h3>Education</h3>
          ${json.education.map(edu => `
            <div class="school">
              <h4>${edu.degree || ''}</h4>
              <p>${edu.school || ''} (${edu.dates || ''})</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${json.skills ? `
        <div class="skills">
          <h3>Skills</h3>
          <p>${Array.isArray(json.skills) ? json.skills.join(', ') : json.skills}</p>
        </div>
      ` : ''}
    </div>
  `;
  return html;
}

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

// Export both functions
module.exports = {
  resumeRenderer: exports.resumeRenderer,
  generateHTMLFromJSON
};
