// Intelligent ATS scoring function that evaluates resume content
export const calculateATSScore = (resume) => {
  if (!resume) return 0;
  
  let score = 0;
  let maxScore = 0;
  let feedback = [];
  
  // Contact Information (max 15 points)
  maxScore += 15;
  if (resume.name?.trim()) {
    score += 5;
  } else {
    feedback.push("Add your full name");
  }
  
  if (resume.email?.trim() && resume.email.includes('@')) {
    score += 5;
  } else {
    feedback.push("Add a valid email address");
  }
  
  if (resume.contact?.trim() || resume.phone?.trim()) {
    score += 5;
  } else {
    feedback.push("Add your phone number");
  }

  // Professional Summary Analysis (max 25 points)
  maxScore += 25;
  if (resume.summary?.trim()) {
    const summaryLength = resume.summary.length;
    const wordCount = resume.summary.split(/\s+/).length;
    
    // Length appropriateness (5 points)
    if (summaryLength >= 200 && summaryLength <= 500) {
      score += 5;
    } else if (summaryLength >= 100) {
      score += 3;
      feedback.push(`Summary should be 200-500 characters (currently ${summaryLength})`);
    } else {
      feedback.push("Summary is too short - aim for 200-500 characters");
    }
    
    // Professional language check (5 points)
    const professionalTerms = ['experience', 'skilled', 'professional', 'expertise', 'specialized', 'accomplished'];
    if (professionalTerms.some(term => resume.summary.toLowerCase().includes(term))) {
      score += 5;
    } else {
      feedback.push("Use more professional language in summary");
    }
    
    // Impact/achievement indicators (5 points)
    if (resume.summary.match(/\d+\s*(years?|%|projects?|teams?|\$|million|thousand)/i)) {
      score += 5;
    } else {
      feedback.push("Include quantifiable achievements in summary");
    }
    
    // Industry relevance (5 points)
    const skills = Array.isArray(resume.skills) ? resume.skills.join(' ').toLowerCase() : '';
    const summaryLower = resume.summary.toLowerCase();
    
    // Check if summary mentions skills from their skills list
    if (resume.skills && resume.skills.some(skill => 
      summaryLower.includes(skill.toLowerCase())
    )) {
      score += 5;
    } else {
      feedback.push("Mention key skills from your skills list in the summary");
    }
    
    // Coherence check (5 points)
    if (wordCount >= 30 && !resume.summary.includes('...') && resume.summary.split('.').length >= 2) {
      score += 5;
    } else {
      feedback.push("Make summary more detailed and coherent");
    }
  } else {
    feedback.push("Add a professional summary highlighting your experience and goals");
  }

  // Work Experience Analysis (max 40 points)
  maxScore += 40;
  if (resume.workExperience?.length > 0) {
    const validExperiences = resume.workExperience.filter(exp => 
      exp.title?.trim() && exp.company?.trim()
    );
    
    // Number of experiences (5 points)
    if (validExperiences.length >= 3) {
      score += 5;
    } else if (validExperiences.length >= 1) {
      score += 3;
    }
    
    let expScore = 0;
    let maxExpScore = validExperiences.length * 10; // Max 10 points per experience
    
    validExperiences.forEach((exp, index) => {
      if (exp.responsibilities?.trim()) {
        const responsibilities = exp.responsibilities.split('\n').filter(r => r.trim());
        
        // Detailed responsibilities (3 points)
        if (responsibilities.length >= 3) {
          expScore += 3;
        } else if (responsibilities.length >= 1) {
          expScore += 1;
          feedback.push(`Add more responsibilities for ${exp.company} (aim for 3-5 bullet points)`);
        }
        
        // Action verbs (3 points)
        const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 
                           'improved', 'increased', 'decreased', 'achieved', 'collaborated', 
                           'coordinated', 'analyzed', 'optimized', 'established', 'delivered'];
        const hasActionVerbs = responsibilities.some(resp => 
          actionVerbs.some(verb => resp.toLowerCase().includes(verb))
        );
        if (hasActionVerbs) {
          expScore += 3;
        } else {
          feedback.push(`Use strong action verbs for ${exp.company} responsibilities`);
        }
        
        // Quantifiable results (4 points)
        const hasMetrics = responsibilities.some(resp => 
          resp.match(/\d+\s*(%|percent|projects?|team|members?|users?|clients?|revenue|\$|million|thousand|hours?|days?|weeks?|months?)/i)
        );
        if (hasMetrics) {
          expScore += 4;
        } else {
          feedback.push(`Add measurable achievements for ${exp.company}`);
        }
      } else {
        feedback.push(`Add detailed responsibilities for ${exp.company}`);
      }
      
      // Duration check
      if (exp.duration?.trim()) {
        expScore += 1; // Bonus for including duration
      }
    });
    
    // Scale experience score to max 35 points
    score += Math.min(expScore, 35);
  } else {
    feedback.push("Add work experience with detailed responsibilities");
  }

  // Skills Analysis (max 15 points)
  maxScore += 15;
  if (resume.skills?.length > 0) {
    const skillCount = resume.skills.length;
    
    // Skill quantity (5 points)
    if (skillCount >= 10) {
      score += 5;
    } else if (skillCount >= 6) {
      score += 3;
    } else if (skillCount >= 3) {
      score += 1;
      feedback.push(`Add more skills (currently ${skillCount}, aim for 8-12)`);
    }
    
    // Skill diversity (5 points)
    const skillsText = resume.skills.join(' ').toLowerCase();
    const hasHardSkills = /\b(programming|software|technical|database|cloud|api|framework|language|tool|platform|system)\b/i.test(skillsText);
    const hasSoftSkills = /\b(leadership|communication|teamwork|management|analytical|problem|creative|collaboration)\b/i.test(skillsText);
    
    if (hasHardSkills && hasSoftSkills) {
      score += 5;
    } else if (hasHardSkills || hasSoftSkills) {
      score += 3;
      feedback.push("Include both technical and soft skills");
    } else {
      feedback.push("Add more specific technical and soft skills");
    }
    
    // Relevance to experience (5 points)
    if (resume.workExperience?.length > 0) {
      const expText = resume.workExperience.map(exp => 
        `${exp.title} ${exp.responsibilities || ''}`
      ).join(' ').toLowerCase();
      
      const relevantSkills = resume.skills.filter(skill => 
        expText.includes(skill.toLowerCase()) || 
        skill.toLowerCase().length > 8 // Assume longer skills are more specific
      );
      
      if (relevantSkills.length >= skillCount * 0.6) {
        score += 5;
      } else if (relevantSkills.length >= skillCount * 0.3) {
        score += 3;
        feedback.push("Ensure skills align with your work experience");
      } else {
        feedback.push("Add skills that match your work experience");
      }
    }
  } else {
    feedback.push("Add relevant technical and soft skills");
  }

  // Education Analysis (max 5 points)
  maxScore += 5;
  if (resume.education?.length > 0) {
    const validEducation = resume.education.filter(edu => 
      edu.degree?.trim() && edu.university?.trim()
    );
    
    if (validEducation.length > 0) {
      score += 3;
      
      // Check for graduation year
      if (validEducation.some(edu => edu.year)) {
        score += 2;
      } else {
        feedback.push("Add graduation years for education entries");
      }
    }
  } else {
    feedback.push("Add your educational background");
  }

  // Calculate final percentage
  const finalScore = Math.round((score / maxScore) * 100);
  
  return {
    score: finalScore,
    feedback: feedback,
    breakdown: {
      contact: Math.round((Math.min(score, 15) / 15) * 100),
      summary: Math.round((Math.min(score - 15, 25) / 25) * 100),
      experience: Math.round((Math.min(score - 40, 40) / 40) * 100),
      skills: Math.round((Math.min(score - 80, 15) / 15) * 100),
      education: Math.round((Math.min(score - 95, 5) / 5) * 100)
    }
  };
};

// Enhanced suggestions generator
export const generatePersonalizedSuggestions = (resume) => {
  const suggestions = {
    summary: [],
    experience: [],
    skills: [],
    education: [],
    overall: []
  };

  if (!resume) return suggestions;

  // Analyze summary
  if (!resume.summary?.trim()) {
    suggestions.summary.push('Write a compelling professional summary that highlights your unique value proposition');
  } else {
    const summaryLength = resume.summary.length;
    const wordCount = resume.summary.split(/\s+/).length;
    
    if (summaryLength < 100) {
      suggestions.summary.push('Expand your summary to better showcase your experience and goals (aim for 200-500 characters)');
    }
    
    if (!resume.summary.match(/\d+/)) {
      suggestions.summary.push('Include specific numbers or metrics in your summary (years of experience, team size, etc.)');
    }
    
    if (wordCount < 20) {
      suggestions.summary.push('Make your summary more detailed - include your key achievements and career focus');
    }
  }

  // Analyze work experience
  if (!resume.workExperience?.length) {
    suggestions.experience.push('Add your work experience with detailed responsibilities and achievements');
  } else {
    resume.workExperience.forEach((exp, index) => {
      if (!exp.title?.trim() || !exp.company?.trim()) {
        suggestions.experience.push(`Complete the job title and company name for position ${index + 1}`);
      }
      
      if (!exp.responsibilities?.trim()) {
        suggestions.experience.push(`Add detailed responsibilities for your role at ${exp.company || 'this company'}`);
      } else {
        const responsibilities = exp.responsibilities.split('\n').filter(r => r.trim());
        
        if (responsibilities.length < 3) {
          suggestions.experience.push(`Add more achievements for ${exp.company} (aim for 3-5 bullet points)`);
        }
        
        const hasMetrics = responsibilities.some(resp => 
          resp.match(/\d+\s*(%|percent|projects?|team|members?|users?|clients?|revenue|\$|million|thousand)/i)
        );
        if (!hasMetrics) {
          suggestions.experience.push(`Add quantifiable results to your achievements at ${exp.company} (e.g., "Increased efficiency by 25%")`);
        }
        
        const actionVerbs = ['led', 'managed', 'developed', 'created', 'implemented', 'designed', 'improved'];
        const hasActionVerbs = responsibilities.some(resp => 
          actionVerbs.some(verb => resp.toLowerCase().startsWith(verb))
        );
        if (!hasActionVerbs) {
          suggestions.experience.push(`Start bullet points with strong action verbs for ${exp.company}`);
        }
      }
      
      if (!exp.duration?.trim()) {
        suggestions.experience.push(`Add the duration of employment for ${exp.company}`);
      }
    });
  }

  // Analyze skills
  if (!resume.skills?.length) {
    suggestions.skills.push('Add relevant technical and soft skills that match your experience');
  } else {
    if (resume.skills.length < 6) {
      suggestions.skills.push(`Expand your skills list (currently ${resume.skills.length}, aim for 8-12 key skills)`);
    }
    
    const skillsText = resume.skills.join(' ').toLowerCase();
    const hasHardSkills = /\b(programming|software|technical|database|cloud|api|framework)\b/i.test(skillsText);
    const hasSoftSkills = /\b(leadership|communication|teamwork|management|analytical)\b/i.test(skillsText);
    
    if (!hasHardSkills) {
      suggestions.skills.push('Add technical skills relevant to your field (software, tools, programming languages, etc.)');
    }
    if (!hasSoftSkills) {
      suggestions.skills.push('Include soft skills like leadership, communication, or problem-solving');
    }
  }

  // Analyze education
  if (!resume.education?.length) {
    suggestions.education.push('Add your educational background');
  } else {
    resume.education.forEach((edu, index) => {
      if (!edu.degree?.trim()) {
        suggestions.education.push(`Specify the degree type for education entry ${index + 1}`);
      }
      if (!edu.university?.trim()) {
        suggestions.education.push(`Add the institution name for education entry ${index + 1}`);
      }
      if (!edu.year?.trim()) {
        suggestions.education.push(`Include graduation year for ${edu.degree || 'your degree'}`);
      }
    });
  }

  // Overall recommendations
  if (!resume.linkedin?.trim()) {
    suggestions.overall.push('Add your LinkedIn profile URL to increase professional visibility');
  }
  
  if (!resume.certifications?.length) {
    suggestions.overall.push('Consider adding relevant certifications to strengthen your credentials');
  }
  
  suggestions.overall.push('Tailor your resume keywords to match specific job descriptions you\'re applying for');
  suggestions.overall.push('Ensure consistent formatting and remove any typos or grammatical errors');

  // Remove empty categories
  Object.keys(suggestions).forEach(key => {
    if (suggestions[key].length === 0) {
      delete suggestions[key];
    }
  });

  return suggestions;
};

// Helper function for score color
export const getScoreColor = (score) => {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 55) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

// Helper function for score message
export const getScoreMessage = (score) => {
  if (score >= 85) return 'Excellent! Your resume is highly optimized for ATS systems.';
  if (score >= 70) return 'Very good! Your resume should perform well with most ATS systems.';
  if (score >= 55) return 'Good progress! A few improvements will make your resume even stronger.';
  if (score >= 40) return 'Getting there! Focus on adding more details and quantifiable achievements.';
  return 'Your resume needs significant optimization for ATS compatibility.';
}; 