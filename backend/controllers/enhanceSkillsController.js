const { generateAIResponse } = require('../utils/groqService');

// ===========================================
// AI-POWERED SKILL ENHANCEMENT ENDPOINT
// ===========================================
exports.enhanceSkills = async (req, res) => {
  try {
    const { workExperience, education, currentSkills } = req.body;

    // Create a comprehensive prompt for skill suggestions
    const prompt = `Based on the following work experience and education, suggest relevant technical and soft skills that would enhance this resume. Do not include any skills that are already in the current skills list.

    Work Experience:
    ${workExperience.map(exp => `${exp.title} at ${exp.company}: ${exp.responsibilities}`).join('\n')}

    Education:
    ${education.map(edu => `${edu.degree} from ${edu.university}`).join('\n')}

    Current Skills:
    ${currentSkills.join(', ')}

    Please suggest only skills that are:
    1. Relevant to the work experience
    2. Not already in the current skills list
    3. In high demand in today's job market
    4. Specific and actionable
    5. A mix of technical and soft skills

    Return ONLY an array of skills, no explanations or formatting.`;

    const response = await generateAIResponse(prompt);
    
    // Clean and parse the response into an array
    const enhancedSkills = response
      .split(/[\n,]/)
      .map(skill => skill.trim())
      .filter(skill => 
        skill && 
        !skill.includes('•') && 
        !skill.includes('-') &&
        !currentSkills.includes(skill)
      );

    res.json({ enhancedSkills });
  } catch (err) {
    console.error('Skill enhancement error:', err);
    res.status(500).json({ message: 'Failed to enhance skills' });
  }
};
