// ATS scoring function that evaluates resume content
export const calculateATSScore = (resume) => {
  if (!resume) return 0;
  
  let score = 0;
  let maxScore = 0;
  
  // Basic Information (max 15 points)
  maxScore += 15;
  if (resume.name?.trim()) score += 5;
  if (resume.email?.trim()) score += 5;
  if (resume.contact?.trim()) score += 5;

  // Professional Summary (max 20 points)
  maxScore += 20;
  if (resume.summary?.trim()) {
    // Length check (5 points)
    if (resume.summary.length >= 100) score += 5;
    else if (resume.summary.length >= 50) score += 3;
    
    // Contains years of experience (5 points)
    if (resume.summary.toLowerCase().includes('years of experience')) score += 5;
    
    // Contains industry keywords (5 points)
    const industryKeywords = ['software', 'development', 'engineering', 'technology', 'it', 'programming'];
    if (industryKeywords.some(keyword => resume.summary.toLowerCase().includes(keyword))) score += 5;
    
    // Contains quantifiable achievements (5 points)
    if (resume.summary.match(/\d+%|\d+ years|\$\d+/)) score += 5;
  }

  // Work Experience (max 35 points)
  maxScore += 35;
  if (resume.workExperience?.length > 0) {
    // Number of experiences (5 points)
    score += Math.min(resume.workExperience.length * 2, 5);

    resume.workExperience.forEach(exp => {
      if (exp.responsibilities) {
        // Detailed responsibilities (max 10 points per experience)
        const responsibilities = exp.responsibilities.split('\n');
        
        // Check number of bullet points (3 points)
        if (responsibilities.length >= 4) score += 3;
        else if (responsibilities.length >= 2) score += 1;

        // Check for action verbs (3 points)
        const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'improved', 'increased', 'decreased', 'achieved'];
        const hasActionVerbs = responsibilities.some(resp => 
          actionVerbs.some(verb => resp.toLowerCase().startsWith(verb))
        );
        if (hasActionVerbs) score += 3;

        // Check for metrics/numbers (4 points)
        const hasMetrics = responsibilities.some(resp => 
          resp.match(/\d+%|\$\d+|\d+ team|\d+ projects?/i)
        );
        if (hasMetrics) score += 4;
      }
    });
  }

  // Skills (max 15 points)
  maxScore += 15;
  if (resume.skills?.length > 0) {
    // Number of skills (5 points)
    if (resume.skills.length >= 8) score += 5;
    else if (resume.skills.length >= 5) score += 3;

    // Technical skills (5 points)
    const technicalSkills = ['java', 'python', 'javascript', 'react', 'node', 'aws', 'cloud', 'sql', 'docker'];
    const hasTechnicalSkills = resume.skills.some(skill => 
      technicalSkills.some(tech => skill.toLowerCase().includes(tech))
    );
    if (hasTechnicalSkills) score += 5;

    // Soft skills (5 points)
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical'];
    const hasSoftSkills = resume.skills.some(skill => 
      softSkills.some(soft => skill.toLowerCase().includes(soft))
    );
    if (hasSoftSkills) score += 5;
  }

  // Education (max 10 points)
  maxScore += 10;
  if (resume.education?.length > 0) {
    resume.education.forEach(edu => {
      // Degree specification (3 points)
      if (edu.degree && (edu.degree.includes('Bachelor') || edu.degree.includes('Master') || edu.degree.includes('PhD'))) {
        score += 3;
      }
      // University name (2 points)
      if (edu.university) score += 2;
      // Graduation year (2 points)
      if (edu.year) score += 2;
    });
  }

  // Additional points (max 5 points)
  maxScore += 5;
  if (resume.linkedin) score += 2;
  if (resume.certifications?.length > 0) score += 3;

  // Calculate final percentage
  return Math.round((score / maxScore) * 100);
};

// Helper function for score color
export const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

// Helper function for score message
export const getScoreMessage = (score) => {
  if (score >= 80) return 'Excellent! Your resume is well-optimized for ATS.';
  if (score >= 60) return 'Good progress! A few more improvements could help.';
  if (score >= 40) return 'Getting there! Focus on adding more details and metrics.';
  return 'Your resume needs more optimization for ATS systems.';
}; 