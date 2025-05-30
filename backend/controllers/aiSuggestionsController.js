// backend/controllers/aiSuggestionsController.js

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

    // Enhance the summary if it's not already enhanced
    const improvedSummary = resume.summary?.includes('Add quantifiable results')
      ? resume.summary
      : `${resume.summary} (Add quantifiable results, highlight certifications if any)`;

    // Normalize skills input into an array
    const skillsArray = Array.isArray(resume.skills)
      ? resume.skills
      : (resume.skills || '').split(',').map(skill => skill.trim());

    // Add a placeholder certification if one doesn't already exist
    if (!skillsArray.some(skill => skill.toLowerCase().includes('certified'))) {
      skillsArray.push('Certified Web Developer');
    }

    // Construct the updated resume
    const updatedResume = {
      ...resume,
      summary: improvedSummary,
      skills: skillsArray
    };

    // Return the modified resume
    res.json({ updatedResume });
  } catch (error) {
    console.error('❌ Error in applySuggestions:', error);
    res.status(500).json({ message: 'Apply suggestion failed' });
  }
};
