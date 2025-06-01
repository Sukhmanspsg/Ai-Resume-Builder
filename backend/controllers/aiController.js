const dotenv = require('dotenv');
dotenv.config();

const { generateAIResponse } = require('../utils/groqService');

// ===============================
// Resume Summary Enhancement
// ===============================
exports.enhanceSummary = async (req, res) => {
  try {
    const { name, education, experience, skills } = req.body;

    const prompt = `You are a professional resume writer. Write ONLY the resume summary itself:
    
    Name: ${name}
    Education: ${education}
    Experience: ${experience}
    Skills: ${skills}
    
    STRICT RULES:
    1. Write EXACTLY 4-5 lines total
    2. Each line must end with a period
    3. Start with role/title and years of experience
    4. Include key achievements with metrics from ALL work experiences
    5. End with career focus or value proposition
    6. Use formal, third-person language
    7. NO introductory phrases or text before the summary
    8. NO bullet points or special formatting
    9. NO first-person pronouns (I, my, etc.)
    10. NO generic phrases like "seeking opportunities"
    11. Start DIRECTLY with the role/title, DO NOT include any introductory text
    12. Combine and synthesize achievements from ALL work experiences
    
    Your response must ONLY contain the summary paragraph — nothing else.`;

    const summary = await generateAIResponse(prompt);
    res.json({ suggestedSummary: summary });
  } catch (err) {
    console.error('Summary generation error:', err);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

// ===============================
// Skill Suggestions
// ===============================
exports.suggestSkills = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.json({ suggestions: [] });
    }

    const prompt = `Based on the partial skill input "${input}", suggest 5 relevant professional skills that would be valuable on a resume. Consider both technical and soft skills. Return ONLY an array of skills, no explanations.`;

    const response = await generateAIResponse(prompt);
    
    // Clean and parse the response into an array
    const suggestions = response
      .split(/[\n,]/)
      .map(skill => skill.trim())
      .filter(skill => 
        skill && 
        !skill.includes('•') && 
        !skill.includes('-') &&
        skill.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5);

    res.json({ suggestions });
  } catch (err) {
    console.error('Skill suggestion error:', err);
    res.status(500).json({ message: 'Failed to suggest skills' });
  }
};
