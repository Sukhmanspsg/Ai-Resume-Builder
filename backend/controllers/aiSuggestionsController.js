// backend/controllers/aiSuggestionsController.js
const { generateAIResponse } = require('../utils/groqService');

// =========================
// GET BASIC AI SUGGESTIONS
// =========================
exports.getSuggestions = async (req, res) => {
  const { resume } = req.body;

  try {
    const suggestions = [];

    // Normalize skills to lowercase string
    const skills = Array.isArray(resume.skills)
      ? resume.skills.join(', ').toLowerCase()
      : (resume.skills || '').toLowerCase();

    // Suggest certification if missing
    if (!skills.includes('certified')) {
      suggestions.push('Include relevant certifications');
    }

    // Suggest quantifiable results if missing digits in summary
    if (!resume.summary || !/\d/.test(resume.summary)) {
      suggestions.push('Use more quantifiable results');
    }

    // Return the list of suggestions
    res.json({ suggestions });
  } catch (err) {
    console.error("❌ Error generating suggestions:", err);
    res.status(500).json({ message: "AI suggestion failed" });
  }
};

// ===============================
// APPLY BASIC AI IMPROVEMENTS
// ===============================
exports.applySuggestions = async (req, res) => {
  try {
    const { resume } = req.body;

    // Validate resume input
    if (!resume || typeof resume !== 'object') {
      return res.status(400).json({ message: 'Invalid resume input' });
    }

    // Use Groq AI to enhance the resume
    const prompt = `Enhance this resume content professionally:

Resume Summary: ${resume.summary || 'Not provided'}
Work Experience: ${resume.workExperience?.map(exp => 
  `${exp.title} at ${exp.company}: ${exp.responsibilities}`
).join('\n') || 'Not provided'}
Skills: ${resume.skills?.join(', ') || 'Not provided'}
Education: ${resume.education?.map(edu => 
  `${edu.degree} from ${edu.university} (${edu.year})`
).join('\n') || 'Not provided'}

Please enhance:
1. Make the summary more impactful with quantifiable achievements
2. Improve work experience descriptions with action verbs
3. Add relevant missing skills
4. Keep the tone professional and concise
5. Maintain factual accuracy - don't invent achievements

Return the enhanced content in JSON format with the following structure:
{
  "summary": "enhanced summary here",
  "workExperience": [array of enhanced work experiences],
  "skills": [array of enhanced skills]
}`;

    const enhancedContent = await generateAIResponse(prompt);
    
    try {
      // Parse the AI response
      const enhancedResume = JSON.parse(enhancedContent);
      
      // Merge the enhanced content with the original resume
      const improvedResume = {
        ...resume,
        summary: enhancedResume.summary || resume.summary,
        workExperience: enhancedResume.workExperience || resume.workExperience,
        skills: [...new Set([...(resume.skills || []), ...(enhancedResume.skills || [])])],
      };

      res.json({ improvedResume });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // If parsing fails, return the original resume with a warning
      res.json({ 
        improvedResume: resume,
        warning: 'Could not parse AI suggestions. No changes were made.'
      });
    }
  } catch (error) {
    console.error('❌ Error in applySuggestions:', error);
    res.status(500).json({ message: 'Apply suggestion failed' });
  }
};
