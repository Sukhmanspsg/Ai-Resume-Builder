const templateModel = require('../models/templateModel');
const Feedback = require('../models/feedbackModel');
const { groqGenerateTemplate, generateAIResponse } = require('../services/groqService');
const injectTemplate = require('../utils/injectTemplate');
const db = require('../db');

// GET ALL TEMPLATES
exports.getAllTemplates = (req, res) => {
  templateModel.getAllTemplates((err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

// GET TEMPLATE BY ID
exports.getTemplateById = (req, res) => {
  const id = req.params.id;

  templateModel.getTemplateById(id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Template not found' });
    res.status(200).json(results[0]);
  });
};

// CREATE NEW TEMPLATE
exports.createTemplate = (req, res) => {
  const { name, description, html_code } = req.body;

  if (!name || !html_code) {
    return res.status(400).json({ message: 'Name and HTML code are required' });
  }

  templateModel.createTemplate(name, description, html_code, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(201).json({ message: 'Template created', templateId: result.insertId });
  });
};

// UPDATE TEMPLATE
exports.updateTemplate = (req, res) => {
  const id = req.params.id;
  const { name, description, html_code } = req.body;

  templateModel.updateTemplate(id, name, description, html_code, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json({ message: 'Template updated successfully' });
  });
};

// DELETE TEMPLATE
exports.deleteTemplate = (req, res) => {
  const id = req.params.id;

  templateModel.deleteTemplate(id, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json({ message: 'Template deleted successfully' });
  });
};

// RENDER TEMPLATE
exports.renderResumeTemplate = async (req, res) => {
  const templateId = req.params.id;
  const resumeId = req.query.resumeId;
  const primaryColor = req.query.primaryColor || '#1A237E';

  console.log("🔍 Rendering template:", templateId, "| Resume ID:", resumeId, "| Color:", primaryColor);

  try {
    // Get template data
    const template = await new Promise((resolve, reject) => {
      templateModel.getTemplateById(templateId, (err, result) => {
        if (err) return reject(err);
        resolve(result?.[0] || null);
      });
    });

    if (!template) {
      console.log("❌ Template not found:", templateId);
      return res.status(404).json({ message: 'Template not found' });
    }

    console.log("✅ Template found:", template.name);

    // Get resume data
    let resumeData = {};
    if (resumeId) {
      try {
        const resumeModel = require('../models/resumeModel');
        const resume = await new Promise((resolve, reject) => {
          resumeModel.getResumeById(resumeId, (err, result) => {
            if (err) return reject(err);
            resolve(result?.[0] || null);
          });
        });

        if (resume && resume.content) {
          try {
            resumeData = JSON.parse(resume.content);
            console.log("✅ Resume data loaded successfully", {
              hasPhoto: !!resumeData.photo,
              photoLength: resumeData.photo?.length,
              name: resumeData.name
            });
          } catch (parseErr) {
            console.warn("⚠️ Failed to parse resume JSON, using empty data");
            resumeData = {};
          }
        } else {
          console.warn("⚠️ Resume not found, using empty data");
        }
      } catch (resumeErr) {
        console.warn("⚠️ Failed to fetch resume, using empty data:", resumeErr.message);
      }
    }

    // Render template with resume data
    let renderedHTML;
    try {
      renderedHTML = injectTemplate(template.html_code, resumeData, primaryColor);
      console.log("✅ Template rendered successfully, length:", renderedHTML.length);
    } catch (injectErr) {
      console.error("❌ Template injection failed:", injectErr.message);
      return res.status(500).json({ message: 'Template injection failed', error: injectErr.message });
    }

    return res.status(200).send(renderedHTML);
  } catch (err) {
    console.error("🔥 Unexpected server error:", err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// AI TEMPLATE GENERATION
exports.generateTemplateWithAI = async (req, res) => {
  try {
    const { userPrompt } = req.body;
    if (!userPrompt) return res.status(400).json({ message: 'Prompt is required' });

    const aiResponse = await groqGenerateTemplate(userPrompt);

    let name = aiResponse?.name || 'Untitled Template';
    let description = aiResponse?.description || 'Generated by AI';
    let html_code = aiResponse?.html_code;

    if (!html_code) {
      return res.status(500).json({ message: 'AI returned incomplete data: html_code missing' });
    }

    // Clean the AI output and ensure required placeholders
    html_code = html_code.replace(/<link\s+rel="stylesheet"\s+href="\/styles\.css">/gi, '');

    const requiredPlaceholders = {
      name: '<h1>{{name}}</h1>',
      title: '<h2>{{title}}</h2>',
      summary: '<p>{{summary}}</p>',
      email: '<p><strong>Email:</strong> {{email}}</p>',
      contact: '<p><strong>Phone:</strong> {{contact}}</p>',
      linkedin: '<p><strong>LinkedIn:</strong> {{linkedin}}</p>',
      skills: '<h3>Skills</h3><ul>{{skills}}</ul>',
      certifications: '<h3>Certifications</h3><ul>{{certifications}}</ul>',
      projects: '<h3>Projects</h3><ul>{{projects}}</ul>',
      education: '<h3>Education</h3><ul>{{education}}</ul>',
      experience: '<h3>Experience</h3><ul>{{experience}}</ul>',
      references: '<h3>References</h3><p>{{references}}</p>'
    };

    const introSection = ['name', 'title', 'email', 'contact', 'linkedin']
      .filter(key => !html_code.includes(`{{${key}}}`))
      .map(key => requiredPlaceholders[key])
      .join('\n');

    html_code = introSection + '\n' + html_code;

    Object.entries(requiredPlaceholders).forEach(([key, htmlSnippet]) => {
      if (!html_code.includes(`{{${key}}}`)) {
        html_code += `\n${htmlSnippet}`;
      }
    });

    templateModel.createTemplate(name, description, html_code, (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.status(201).json({ message: 'Template created', templateId: result.insertId });
    });
  } catch (err) {
    console.error('❌ Failed to generate template:', err.stack || err);
    res.status(500).json({ message: 'AI template generation failed', error: err.message });
  }
};

// GENERATE AI TEMPLATE
exports.generateTemplate = async (req, res) => {
  const { userPrompt } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  // Check if GROQ API key is available
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in environment variables');
    return res.status(500).json({ 
      message: 'AI service not configured. Please contact administrator.',
      error: 'GROQ_API_KEY not set' 
    });
  }

  console.log('✅ GROQ_API_KEY found, proceeding with template generation...');

  try {
    const aiResponse = await groqGenerateTemplate(userPrompt);

    if (!aiResponse || !aiResponse.component_code) {
      throw new Error('Invalid response from AI service');
    }

    // Return the template data directly to the frontend
    res.status(200).json({
      template: {
        name: aiResponse.name,
        description: aiResponse.description,
        component_code: aiResponse.component_code
      }
    });
  } catch (err) {
    console.error('❌ Failed to generate template:', err);
    res.status(500).json({ 
      message: 'AI template generation failed', 
      error: err.message 
    });
  }
};

// Helper function to extract React component code from OpenAI response
function extractComponentCode(response) {
  // Look for code blocks in markdown format
  const codeBlockMatch = response.match(/```(?:jsx|javascript|react)?\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code blocks found, return the entire response
  return response.trim();
}

module.exports = {
  getAllTemplates: exports.getAllTemplates,
  renderResumeTemplate: exports.renderResumeTemplate,
  createTemplate: exports.createTemplate,
  updateTemplate: exports.updateTemplate,
  deleteTemplate: exports.deleteTemplate,
  generateTemplateWithAI: exports.generateTemplateWithAI,
  getTemplateById: exports.getTemplateById,
  generateTemplate: exports.generateTemplate
};
