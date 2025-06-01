const express = require('express');
const router = express.Router();
const { generateAIResponse } = require('../utils/groqService');

const aiController = require('../controllers/aiController');
const { enhanceSkills } = require('../controllers/enhanceSkillsController');

// ============================================
// ROUTE: POST /api/ai
// PURPOSE: Generate job responsibilities using Groq AI
// ============================================
router.post('/', async (req, res) => {
  try {
    const { experience, title, company } = req.body;
    
    const prompt = `Generate professional and concise job responsibilities for a ${title || 'professional'} position${company ? ` at ${company}` : ''}.

STRICT RULES:
1. MAXIMUM 7 WORDS per responsibility
2. Start with strong action verbs
3. Be specific and impactful
4. NO asterisks or special characters
5. NO explanatory text
6. Focus on key achievements

GOOD EXAMPLES:
- Optimized database queries for faster performance
- Led agile development team of six
- Implemented automated testing reducing critical bugs
- Redesigned core payment processing system
- Mentored junior developers in web technologies

BAD EXAMPLES:
- Created** and developed** a new system (uses asterisks)
- Responsible for maintaining the website (passive voice)
- Successfully managed to improve performance significantly (too wordy)
- Worked on various projects (too vague)

Generate 6-8 concise, impactful responsibilities.`;

    const suggestions = await generateAIResponse(prompt);
    
    // Clean up the response
    const cleanedSuggestions = suggestions
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        const trimmed = line.toLowerCase();
        // Filter out explanatory text and invalid lines
        if (!line) return false;
        if (trimmed.includes('example')) return false;
        if (trimmed.includes('here are')) return false;
        if (trimmed.includes('guidelines')) return false;
        if (trimmed.includes('following')) return false;
        if (trimmed.includes('should be')) return false;
        if (trimmed.includes('can be')) return false;
        if (trimmed.includes('must be')) return false;
        // Only keep lines that start with an action verb
        return /^[A-Z][a-z]+(?:ed|ing)?\s/.test(line);
      })
      .map(line => {
        // Clean up the text
        let cleaned = line
          .replace(/^[•\-\+\*]+\s*/, '') // Remove bullet points
          .replace(/^\d+\.\s*/, '') // Remove numbering
          .replace(/\*\*/g, '') // Remove asterisks
          .replace(/^[^a-zA-Z]+/, '') // Remove any leading non-letter characters
          .trim();

        // Ensure first letter is capitalized
        if (cleaned) {
          cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }

        return cleaned;
      })
      .filter(line => {
        // Validate line length and content
        const words = line.split(/\s+/);
        if (words.length > 7) return false; // Enforce 7-word limit
        if (line.length < 10) return false; // Remove very short lines
        if (line.includes('*')) return false; // Remove any remaining asterisks
        return true;
      });

    // If we filtered out everything, try to get suggestions again
    if (cleanedSuggestions.length === 0) {
      const retryPrompt = `Generate 6-8 job responsibilities (MAXIMUM 7 WORDS each) for a ${title || 'professional'} position. Example: "Optimized database performance for high-traffic website"`;
      
      const retrySuggestions = await generateAIResponse(retryPrompt);
      return res.json({ suggestedSummary: retrySuggestions });
    }

    res.json({ suggestedSummary: cleanedSuggestions.join('\n') });
  } catch (err) {
    res.status(500).json({ message: 'AI generation failed', error: err.message });
  }
});

// ============================================
// ROUTE: POST /api/ai/enhance-skills
// PURPOSE: Suggest additional resume skills based on job info
// ============================================
router.post('/enhance-skills', async (req, res) => {
  try {
    const { workExperience, education, currentSkills } = req.body;

    const prompt = `Based on this professional background, suggest relevant technical and soft skills:

    Work Experience: ${workExperience.map(exp => 
      `${exp.title} at ${exp.company}: ${exp.responsibilities}`
    ).join('\n')}
    
    Education: ${education.map(edu => 
      `${edu.degree} from ${edu.university}`
    ).join('\n')}
    
    Current Skills: ${currentSkills.join(', ')}

    Rules:
    1. Return ONLY skill names
    2. One skill per line
    3. NO numbers or periods at the start
    4. NO quotes, brackets, or special characters
    5. NO categories or headers
    6. NO descriptions or explanations
    7. NO duplicate skills from current skills list
    8. NO formatting or prefixes
    9. JUST the skill name, nothing else

    Example format:
    Network Security
    Project Management
    Data Analysis
    Cloud Computing`;

    const response = await generateAIResponse(prompt);
    
    // Clean and process the response
    const enhancedSkills = response
      .split('\n')
      .map(skill => skill.trim())
      // Remove numbers and periods from the start
      .map(skill => skill.replace(/^\d+\.\s*/, ''))
      // Remove any other special characters
      .map(skill => skill.replace(/[\[\]"']/g, ''))
      // Remove any empty lines or lines with just special characters
      .filter(skill => skill && !skill.includes(':') && !skill.includes('-'))
      // Remove duplicates and skills that are already in currentSkills
      .filter(skill => !currentSkills.includes(skill));

    res.json({ enhancedSkills });
  } catch (err) {
    console.error('❌ Skill enhancement failed:', err);
    res.status(500).json({ 
      message: 'Failed to enhance skills',
      error: err.message 
    });
  }
});

// ============================================
// ROUTE: POST /api/ai/summary
// PURPOSE: Generate a resume summary using Groq AI
// ============================================
router.post('/summary', async (req, res) => {
  try {
    const { experience, education, skills, certifications } = req.body;
    
    const prompt = `Generate a professional resume summary that highlights your expertise and value proposition.

STRICT RULES:
1. Start DIRECTLY with role and general experience level (entry-level, mid-level, senior, etc.)
2. NO introductory phrases like "Here is" or "Summary:"
3. NO headers or labels
4. NO quotation marks
5. NO bullet points
6. Each line must end with a period
7. Focus on key skills and general achievements
8. Use only third-person language
9. Output ONLY the summary text itself
10. Keep it general and realistic - NO specific metrics unless provided
11. Maximum 4 sentences
12. Focus on value and impact rather than numbers

Using this background information:
Experience: ${experience || 'N/A'}
Education: ${education || 'N/A'}
Skills: ${skills || 'N/A'}
Certifications: ${certifications || 'N/A'}`;

    const suggestions = await generateAIResponse(prompt);
    
    // Clean up the response to remove any unwanted text
    let cleanedSummary = suggestions
      // Remove common prefixes including "resume summary:"
      .replace(/^(here is|here's|this is|summary:|professional summary:|resume summary:|summary of|summary for)[:.\s]*/i, '')
      // Remove any leading quotes or spaces
      .replace(/^["'\s]+/, '')
      // Remove any trailing quotes or spaces
      .replace(/["'\s]+$/, '')
      // Remove any other variations of summary prefix
      .replace(/^.*summary.*?:/i, '')
      // Clean up any double spaces
      .replace(/\s+/g, ' ')
      .trim();

    res.json({ suggestedSummary: cleanedSummary });
  } catch (err) {
    console.error('❌ Summary generation failed:', err);
    res.status(500).json({ 
      message: 'Failed to generate summary',
      error: err.message 
    });
  }
});

// ============================================
// ROUTE: POST /api/ai/suggest-skills
// PURPOSE: Dynamically suggest skills as user types
// ============================================
router.post('/suggest-skills', aiController.suggestSkills);

// ============================================
// ROUTE: POST /api/ai/cover-letter
// PURPOSE: Generate a cover letter using Groq AI
// ============================================
router.post('/cover-letter', async (req, res) => {
  const { resume, jobDescription, companyName, recipientName, jobTitle } = req.body;

  if (!resume || !jobDescription || !companyName) {
    return res.status(400).json({
      message: 'Missing required fields: resume, jobDescription, or companyName'
    });
  }

  try {
    const prompt = `
      Write a cover letter that connects the candidate's experience with the job requirements. Start DIRECTLY with "Dear ${recipientName || 'Hiring Manager'}," - NO introductory text

      CANDIDATE DETAILS:
      - Name: ${resume.name}
      - Current Role: ${resume.workExperience?.[0]?.title || 'Professional'}
      - Experience Summary: ${resume.summary}
      - Key Skills: ${resume.skills?.join(', ')}
      - Current Company: ${resume.workExperience?.[0]?.company || ''}
      - Notable Achievements: ${resume.workExperience?.[0]?.responsibilities || ''}

      JOB APPLICATION DETAILS:
      - Company: ${companyName}
      - Position: ${jobTitle || 'the position'}
      - Job Description: ${jobDescription}

      STRICT REQUIREMENTS:
      1. Start DIRECTLY with "Dear ${recipientName || 'Hiring Manager'}," - NO introductory text
      2. First Paragraph: Express interest in the specific role and briefly mention your current role and years of experience
      3. Second Paragraph: Detail 2-3 specific, relevant achievements from your current role that relate to the new position
      4. Third Paragraph: Explain why you're interested in this specific company and role, referencing company values or projects
      5. Closing Paragraph: Thank them for their consideration and express interest in discussing further
      6. End with "Best regards," or "Sincerely," followed by name
      7. Keep language professional and realistic
      8. Focus ONLY on real experience and actual job requirements
      9. Use specific numbers and metrics from the resume when available
      10. DO NOT include ANY template language or explanatory text
      11. DO NOT include ANY headers or section labels
      12. DO NOT include contact information or date (we add those separately)
      13. DO NOT repeat the greeting

      TONE REQUIREMENTS:
      - Professional and formal
      - Confident but not arrogant
      - Enthusiastic but serious
      - Focused on real qualifications
      - NO creative writing or humor
      - NO fictional scenarios or made-up skills

      Format: Standard business letter paragraphs with clear spacing between sections. Start DIRECTLY with the greeting.
    `;

    const response = await generateAIResponse(prompt, {
      temperature: 0.4, // Further reduced for more consistent output
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.8,
      presence_penalty: 0.8
    });

    res.json({ coverLetter: response });
  } catch (err) {
    console.error('Failed to generate cover letter:', err);
    res.status(500).json({ 
      message: 'Failed to generate cover letter',
      error: err.message 
    });
  }
});

module.exports = router;
