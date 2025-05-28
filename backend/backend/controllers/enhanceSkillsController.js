const { generateAIResponse } = require('../utils/groqService');

// ===========================================
// AI-POWERED SKILL ENHANCEMENT ENDPOINT
// ===========================================
exports.enhanceSkills = async (req, res) => {
  const { jobTitle, responsibilities, education, currentSkills } = req.body;

  // Create prompt for the AI model to suggest missing skills
  const prompt = `
    Based on the following resume information:
    - Job Title: ${jobTitle}
    - Responsibilities: ${responsibilities}
    - Education: ${education}
    - Current Skills: ${currentSkills}
    
    Suggest 5 relevant skills that are missing.
    Respond only with a JSON array like ["Skill A", "Skill B", "Skill C"].
  `;

  try {
    // Get raw AI response (string)
    const raw = await generateAIResponse(prompt);
    let parsed;

    try {
      // Try to parse response as JSON
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: extract and parse JSON array if wrapped in extra text
      const jsonMatch = raw.match(/\[.*\]/s); // match anything in brackets
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    // Validate that the result is an array
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed response is not an array');
    }

    // Send enhanced skill suggestions to client
    res.json({ enhancedSkills: parsed });
  } catch (err) {
    console.error('Groq Skill Suggestion Error:', err.message);
    res.status(500).json({ message: 'AI failed to suggest skills.' });
  }
};
