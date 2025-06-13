// backend/controllers/aiSuggestionsController.js
const { generateAIResponse } = require('../utils/groqService');

// =========================
// GET INTELLIGENT AI SUGGESTIONS
// =========================
exports.getSuggestions = async (req, res) => {
  const { resume } = req.body;

  try {
    if (!resume || typeof resume !== 'object') {
      return res.status(400).json({ message: 'Invalid resume input' });
    }

    // Analyze the resume content and provide specific suggestions
    const suggestions = await analyzeResumeContent(resume);
    
    res.json({ suggestions });
  } catch (err) {
    console.error("❌ Error generating suggestions:", err);
    res.status(500).json({ message: "AI suggestion failed" });
  }
};

// Helper function to analyze resume content
const analyzeResumeContent = async (resume) => {
  const suggestions = [];

  // Analyze summary
  if (!resume.summary?.trim()) {
    suggestions.push('Write a compelling professional summary that showcases your unique value');
  } else if (resume.summary.length < 100) {
    suggestions.push('Expand your professional summary to 200-400 characters for better impact');
  } else if (!resume.summary.match(/\d+/)) {
    suggestions.push('Include quantifiable metrics in your summary (years of experience, team size, etc.)');
  }

  // Analyze work experience
  if (!resume.workExperience?.length) {
    suggestions.push('Add detailed work experience with specific achievements');
  } else {
    let experienceIssues = 0;
    resume.workExperience.forEach((exp) => {
      if (!exp.responsibilities?.trim()) {
        experienceIssues++;
      } else {
        const responsibilities = exp.responsibilities.split('\n').filter(r => r.trim());
        if (responsibilities.length < 3) {
          experienceIssues++;
        }
        if (!responsibilities.some(resp => resp.match(/\d+/))) {
          experienceIssues++;
        }
      }
    });
    
    if (experienceIssues > 0) {
      suggestions.push('Add more detailed achievements with quantifiable results to your work experience');
    }
  }

  // Analyze skills
  if (!resume.skills?.length) {
    suggestions.push('Add relevant technical and soft skills');
  } else if (resume.skills.length < 6) {
    suggestions.push(`Expand your skills list (currently ${resume.skills.length}, aim for 8-12 skills)`);
  }

  // Overall suggestions
  if (!resume.linkedin?.trim()) {
    suggestions.push('Add your LinkedIn profile for better professional visibility');
  }

  if (suggestions.length === 0) {
    suggestions.push('Your resume looks comprehensive! Consider tailoring it for specific job applications');
  }

  return suggestions;
};

// ===============================
// APPLY INTELLIGENT AI IMPROVEMENTS
// ===============================
exports.applySuggestions = async (req, res) => {
  try {
    const { resume } = req.body;

    // Validate resume input
    if (!resume || typeof resume !== 'object') {
      return res.status(400).json({ message: 'Invalid resume input' });
    }

    // Create a comprehensive prompt for enhancement
    const prompt = `You are a professional resume writer and career coach. Please enhance this resume content to make it more impactful and ATS-friendly while maintaining accuracy and truthfulness.

Current Resume Content:
Name: ${resume.name || 'Not provided'}
Summary: ${resume.summary || 'Not provided'}

Work Experience:
${resume.workExperience?.map((exp, index) => 
  `${index + 1}. ${exp.title || 'Position'} at ${exp.company || 'Company'} (${exp.duration || 'Duration not specified'})
  Current responsibilities: ${exp.responsibilities || 'Not specified'}`
).join('\n\n') || 'No work experience provided'}

Skills: ${resume.skills?.join(', ') || 'Not provided'}

Education:
${resume.education?.map((edu, index) => 
  `${index + 1}. ${edu.degree || 'Degree'} from ${edu.university || 'University'} (${edu.year || 'Year not specified'})`
).join('\n') || 'Not provided'}

Certifications: ${resume.certifications?.join(', ') || 'None listed'}

ENHANCEMENT RULES:
1. Improve the professional summary to be more impactful (200-400 characters)
2. Enhance work experience descriptions with strong action verbs and quantifiable achievements
3. Suggest additional relevant skills based on the work experience
4. Keep all factual information accurate - do NOT invent specific numbers or achievements
5. Use professional language and industry-standard terminology
6. Make it ATS-friendly with relevant keywords
7. Ensure consistency in formatting and tone

IMPORTANT: Only suggest realistic improvements. Do not add false metrics or achievements.

Return your response in this exact JSON format:
{
  "summary": "enhanced professional summary here",
  "workExperience": [
    {
      "title": "existing or enhanced title",
      "company": "existing company name",
      "duration": "existing or suggested duration format",
      "responsibilities": "enhanced responsibilities with bullet points separated by \\n"
    }
  ],
  "skills": ["enhanced skills array including existing and suggested new ones"],
  "improvements": ["list of specific improvements made"]
}`;

    const enhancedContent = await generateAIResponse(prompt);
    
    try {
      // Parse the AI response
      const enhancedResume = JSON.parse(enhancedContent);
      
      // Validate the response structure
      if (!enhancedResume.summary && !enhancedResume.workExperience && !enhancedResume.skills) {
        throw new Error('Invalid AI response structure');
      }
      
      // Merge the enhanced content with the original resume, preserving original data when enhancement fails
      const improvedResume = {
        ...resume,
        summary: enhancedResume.summary || resume.summary,
        workExperience: enhancedResume.workExperience?.length > 0 ? 
          enhancedResume.workExperience.map((enhancedExp, index) => ({
            ...resume.workExperience[index],
            ...enhancedExp
          })) : resume.workExperience,
        skills: enhancedResume.skills?.length > 0 ? 
          [...new Set([...(resume.skills || []), ...enhancedResume.skills])] : resume.skills,
      };

      res.json({ 
        improvedResume,
        improvements: enhancedResume.improvements || ['General enhancements applied'],
        message: 'Resume successfully enhanced with AI recommendations'
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', enhancedContent);
      
      // Fallback: provide basic improvements
      const basicImprovements = await applyBasicImprovements(resume);
      res.json({ 
        improvedResume: basicImprovements,
        warning: 'Applied basic improvements due to AI parsing issues',
        improvements: ['Basic formatting and language improvements applied']
      });
    }
  } catch (error) {
    console.error('❌ Error in applySuggestions:', error);
    res.status(500).json({ message: 'Apply suggestion failed' });
  }
};

// Fallback function for basic improvements
const applyBasicImprovements = async (resume) => {
  const improved = { ...resume };
  
  // Basic summary improvement
  if (!improved.summary?.trim()) {
    improved.summary = `Professional with experience in ${resume.workExperience?.[0]?.title || 'their field'}. Skilled in ${resume.skills?.slice(0, 3).join(', ') || 'various technologies'}. Seeking to contribute expertise and drive results in a dynamic organization.`;
  }
  
  // Basic work experience improvements
  if (improved.workExperience?.length > 0) {
    improved.workExperience = improved.workExperience.map(exp => ({
      ...exp,
      responsibilities: exp.responsibilities ? 
        exp.responsibilities.split('\n')
          .map(resp => resp.trim())
          .map(resp => resp.startsWith('•') ? resp : `• ${resp}`)
          .join('\n') 
        : `• Performed ${exp.title || 'professional'} duties at ${exp.company || 'the company'}\n• Collaborated with team members to achieve objectives\n• Contributed to organizational goals and success`
    }));
  }
  
  return improved;
};
