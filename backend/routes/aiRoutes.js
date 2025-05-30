const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const { enhanceSkills } = require('../controllers/enhanceSkillsController');
const { generateAIResponse } = require('../utils/groqService');

// ============================================
// ROUTE: POST /api/ai
// PURPOSE: Generate a resume summary using Groq AI
// ============================================
router.post('/', async (req, res) => {
  const { education, experience, skills } = req.body;

  const prompt = `Write a professional resume summary based on the following details:
  Education: ${education}
  Experience: ${experience}
  Skills: ${skills}`;

  try {
    // Send prompt to Groq for AI-generated summary
    const summary = await generateAIResponse(prompt);
    res.json({ suggestedSummary: summary });
  } catch (err) {
    res.status(500).json({ message: 'AI generation failed', error: err.message });
  }
});

// ============================================
// ROUTE: POST /api/ai/enhance-skills
// PURPOSE: Suggest additional resume skills based on job info
// ============================================
router.post('/enhance-skills', enhanceSkills);

// ============================================
// ROUTE: POST /api/ai/suggest-skills
// PURPOSE: Dynamically suggest skills as user types
// ============================================
router.post('/suggest-skills', aiController.suggestSkills);

module.exports = router;
