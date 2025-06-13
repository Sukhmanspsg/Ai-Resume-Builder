const resumeModel = require('../models/resumeModel.js');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// CREATE A NEW RESUME
const createResume = (req, res) => {
  console.log("➡️ Reached createResume route");

  const { title, name, content } = req.body;
  
  // Handle both 'title' and 'name' fields for compatibility
  const resumeTitle = title || name || 'Untitled Resume';
  
  // Check if user is authenticated (for regular resumes) or allow temporary resumes
  let user_id = null;
  if (req.user && req.user.id) {
    user_id = req.user.id;
    console.log("👤 Authenticated user:", user_id);
  } else {
    user_id = 1; // Use user_id = 1 for temporary resumes (assuming user 1 exists)
    console.log("🔄 Creating temporary resume (user_id = 1)");
  }
  
  const template_id = req.body.template_id || 1;

  if (!content) {
    return res.status(400).json({ message: 'Content is required.' });
  }

  // Handle content - if it's already a string, use it; if object, stringify it
  let stringifiedContent;
  if (typeof content === 'string') {
    stringifiedContent = content;
  } else {
    stringifiedContent = JSON.stringify(content);
  }

  resumeModel.createResume(user_id, template_id, resumeTitle, stringifiedContent, (err, result) => {
    if (err) {
      console.error('Database error in createResume:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({ message: 'Resume created', resumeId: result.insertId });
  });
};

// GET ALL RESUMES
const getUserResumes = (req, res) => {
  const userId = req.params.userId;

  resumeModel.getUserResumes(userId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json(results);
  });
};

// GET RESUME BY ID
const getResumeById = (req, res) => {
  const resumeId = req.params.id;

  resumeModel.getResumeById(resumeId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) return res.status(404).json({ message: 'Resume not found' });

    res.status(200).json(results[0]);
  });
};

// UPDATE RESUME
const updateResume = (req, res) => {
  const resumeId = req.params.id;
  const { template_id, title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const safeTemplateId = template_id || 1;
  const stringifiedContent = JSON.stringify(content);

  resumeModel.updateResume(resumeId, safeTemplateId, title, stringifiedContent, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Resume updated successfully' });
  });
};

// DELETE RESUME
const deleteResume = (req, res) => {
  const resumeId = req.params.id;

  resumeModel.deleteResume(resumeId, (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    res.status(200).json({ message: 'Resume deleted' });
  });
};

// UPLOAD RESUME FILE
const uploadResumeFile = [
  upload.single('resumeFile'),
  async (req, res) => {
    console.log('📄 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📄 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    try {
      let extractedText = '';

      console.log('📄 Processing file with extension:', fileExt);

      if (fileExt === '.pdf') {
        console.log('📄 Processing PDF file...');
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);
        extractedText = parsed.text;
        console.log('📄 PDF text extracted, length:', extractedText.length);
      } else if (fileExt === '.docx') {
        console.log('📄 Processing DOCX file...');
        const data = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: data });
        extractedText = result.value;
        console.log('📄 DOCX text extracted, length:', extractedText.length);
      } else if (fileExt === '.doc') {
        console.log('📄 Processing DOC file...');
        // Try to handle .doc files as well
        const data = fs.readFileSync(filePath);
        try {
          const result = await mammoth.extractRawText({ buffer: data });
          extractedText = result.value;
          console.log('📄 DOC text extracted, length:', extractedText.length);
        } catch (docError) {
          console.log('❌ DOC parsing failed, file might be corrupted or in older format');
          throw new Error('Unable to process .doc file. Please convert to .docx or .pdf format.');
        }
      } else {
        console.log('❌ Unsupported file format:', fileExt);
        return res.status(400).json({ 
          message: `Unsupported file format: ${fileExt}. Please upload PDF, DOC, or DOCX files.` 
        });
      }

      // Check if we extracted any text
      if (!extractedText || extractedText.trim().length === 0) {
        console.log('❌ No text extracted from file');
        throw new Error('No readable text found in the uploaded file. Please ensure the file is not password-protected or corrupted.');
      }

      console.log('📄 Extracted text preview (first 300 chars):', extractedText.substring(0, 300));

      // Clean up the uploaded file
      try {
        fs.unlinkSync(filePath);
        console.log('📄 Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temporary file:', cleanupError.message);
      }

      // Parse the raw text into structured resume data
      console.log('📄 Starting text parsing...');
      const structuredData = parseResumeText(extractedText);
      
      // Validate that we got some useful data
      const hasBasicInfo = structuredData.name || structuredData.email || 
                          structuredData.workExperience.length > 0 || 
                          structuredData.education.length > 0;
      
      if (!hasBasicInfo) {
        console.log('⚠️ Warning: Very little data extracted from resume');
        // Still return the data but with a warning
        structuredData.parsingWarning = 'Limited data could be extracted. Please review and add missing information.';
      }

      console.log('📄 Successfully parsed resume data:', {
        name: structuredData.name || 'Not found',
        email: structuredData.email || 'Not found',
        workExperience: structuredData.workExperience.length,
        education: structuredData.education.length,
        skills: structuredData.skills.length
      });
      
      res.status(200).json(structuredData);
    } catch (err) {
      console.error('❌ Error processing uploaded file:', err);
      
      // Clean up file if it still exists
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up file after error:', cleanupError.message);
      }

      // Return specific error message
      const errorMessage = err.message.includes('Unable to process') || 
                          err.message.includes('No readable text') ||
                          err.message.includes('password-protected')
                          ? err.message 
                          : 'Failed to extract resume content. Please try a different file format or ensure the file is not corrupted.';

      res.status(500).json({ 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
];

// Function to parse raw resume text into structured data
const parseResumeText = (text) => {
  console.log('📄 Starting resume parsing...');
  console.log('📄 Raw text length:', text.length);
  
  if (!text || text.trim().length === 0) {
    console.log('❌ No text provided for parsing');
    return getDefaultResumeStructure();
  }

  try {
    // Try the advanced parsing first
    const result = advancedParseResumeText(text);
    
    // If advanced parsing found very little, try fallback
    const hasMinimalData = !result.name && !result.email && 
                          result.workExperience.length === 0 && 
                          result.education.length === 0;
    
    if (hasMinimalData) {
      console.log('📄 Advanced parsing found minimal data, trying fallback method...');
      const fallbackResult = fallbackParseResumeText(text);
      
      // Merge results, preferring non-empty values
      return {
        title: fallbackResult.title || result.title,
        name: fallbackResult.name || result.name,
        email: fallbackResult.email || result.email,
        contact: fallbackResult.contact || result.contact,
        linkedin: fallbackResult.linkedin || result.linkedin,
        summary: fallbackResult.summary || result.summary,
        workExperience: fallbackResult.workExperience.length > 0 ? fallbackResult.workExperience : result.workExperience,
        education: fallbackResult.education.length > 0 ? fallbackResult.education : result.education,
        skills: [...result.skills, ...fallbackResult.skills].filter((v, i, a) => a.indexOf(v) === i), // dedupe
        certifications: [...result.certifications, ...fallbackResult.certifications].filter((v, i, a) => a.indexOf(v) === i),
        references: fallbackResult.references || result.references
      };
    }
    
    return result;
  } catch (error) {
    console.error('📄 Error in parsing, using fallback method:', error);
    return fallbackParseResumeText(text);
  }
};

// Advanced parsing method (existing complex logic)
const advancedParseResumeText = (text) => {
  console.log('📄 Using advanced parsing method...');
  console.log('📄 First 200 chars:', text.substring(0, 200));
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('📄 Total lines after filtering:', lines.length);
  console.log('📄 First 10 lines:', lines.slice(0, 10));
  
  const resumeData = getDefaultResumeStructure();

  // Helper function to check if a line contains certain keywords
  const containsKeywords = (line, keywords) => {
    return keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()));
  };

  // Helper function to check if a line is likely a section header
  const isSectionHeader = (line) => {
    const headers = [
      'professional summary', 'summary', 'profile', 'objective',
      'work experience', 'experience', 'employment', 'career', 'professional experience',
      'education', 'academic', 'qualifications', 'academic background',
      'skills', 'technical skills', 'competencies', 'expertise', 'core competencies',
      'certification', 'certificates', 'licenses', 'certifications',
      'reference', 'references', 'projects', 'achievements'
    ];
    
    const lowerLine = line.toLowerCase();
    return headers.some(header => {
      // Check if line starts with header or contains header as a standalone word
      return lowerLine === header || 
             lowerLine.startsWith(header + ':') || 
             lowerLine.startsWith(header + ' ') ||
             (lowerLine.includes(header) && line.length < 30); // Short lines likely to be headers
    });
  };

  // Extract contact information
  extractContactInfo(text, resumeData);

  // Extract name (usually the first non-empty line or line before contact info)
  if (lines.length > 0) {
    // Look for name in first few lines, avoiding lines with @ or phone numbers
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (!line.includes('@') && 
          !line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && 
          !containsKeywords(line, ['resume', 'cv', 'curriculum']) && 
          !isSectionHeader(line) &&
          line.length > 2 && line.length < 50 &&
          !line.toLowerCase().includes('http') &&
          !line.toLowerCase().includes('linkedin')) {
        resumeData.name = line;
        console.log('📄 Found name:', resumeData.name);
        break;
      }
    }
  }

  // Set title based on name
  if (resumeData.name) {
    resumeData.title = `${resumeData.name}'s Resume`;
  }

  // Parse sections more accurately
  let currentSection = '';
  let sectionContent = [];
  
  console.log('📄 Starting section parsing...');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Skip contact information lines
    if (line.includes('@') || line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || line.includes('linkedin.com')) {
      console.log('📄 Skipping contact line:', line);
      continue;
    }

    // Check if this line is a section header
    if (isSectionHeader(line)) {
      // Process the previous section before starting a new one
      if (currentSection && sectionContent.length > 0) {
        console.log(`📄 Processing section "${currentSection}" with ${sectionContent.length} lines:`, sectionContent);
        processSection(currentSection, sectionContent, resumeData);
      }
      
      // Determine the new section
      if (containsKeywords(lowerLine, ['professional summary', 'summary', 'profile', 'objective'])) {
        currentSection = 'summary';
      } else if (containsKeywords(lowerLine, ['work experience', 'experience', 'employment', 'career', 'professional experience'])) {
        currentSection = 'experience';
      } else if (containsKeywords(lowerLine, ['education', 'academic', 'qualifications'])) {
        currentSection = 'education';
      } else if (containsKeywords(lowerLine, ['skills', 'technical skills', 'competencies', 'expertise'])) {
        currentSection = 'skills';
      } else if (containsKeywords(lowerLine, ['certification', 'certificates', 'licenses'])) {
        currentSection = 'certifications';
      } else if (containsKeywords(lowerLine, ['reference'])) {
        currentSection = 'references';
      }
      
      console.log(`📄 Found section header: "${line}" -> Section: "${currentSection}"`);
      sectionContent = [];
      continue;
    }

    // Add content to current section if we have one
    if (currentSection && line.length > 2) {
      // Skip lines that look like contact info or headers
      if (!line.includes(resumeData.name) && 
          !line.includes(resumeData.email) && 
          !line.includes(resumeData.contact)) {
        console.log(`📄 Adding to "${currentSection}":`, line);
        sectionContent.push(line);
      }
    }
  }

  // Process the last section
  if (currentSection && sectionContent.length > 0) {
    console.log(`📄 Processing final section "${currentSection}" with ${sectionContent.length} lines:`, sectionContent);
    processSection(currentSection, sectionContent, resumeData);
  }

  return finalizeResumeData(resumeData);
};

// Simple fallback parsing method
const fallbackParseResumeText = (text) => {
  console.log('📄 Using fallback parsing method...');
  
  const resumeData = getDefaultResumeStructure();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract contact information
  extractContactInfo(text, resumeData);
  
  // Simple name extraction - first meaningful line
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 50 && 
        !line.includes('@') && !line.match(/\d{3}/) && 
        !line.toLowerCase().includes('resume')) {
      resumeData.name = line;
      break;
    }
  }
  
  // Simple text-based extraction
  const textLower = text.toLowerCase();
  
  // Extract everything as a summary if no clear sections found
  const meaningfulLines = lines.filter(line => 
    line.length > 10 && 
    !line.includes('@') && 
    !line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) &&
    !line.includes('linkedin.com')
  );
  
  if (meaningfulLines.length > 0) {
    resumeData.summary = meaningfulLines.slice(0, 3).join(' ').substring(0, 500);
  }
  
  // Extract skills based on common tech terms
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css',
    'communication', 'leadership', 'management', 'teamwork', 'problem solving'
  ];
  
  resumeData.skills = commonSkills.filter(skill => 
    textLower.includes(skill)
  );
  
  if (resumeData.name) {
    resumeData.title = `${resumeData.name}'s Resume`;
  }
  
  console.log('📄 Fallback parsing complete:', {
    name: resumeData.name || 'Not found',
    email: resumeData.email || 'Not found',
    summary: resumeData.summary ? 'Present' : 'Not found',
    skills: resumeData.skills.length
  });
  
  return resumeData;
};

// Helper function to get default resume structure
const getDefaultResumeStructure = () => ({
  title: '',
  name: '',
  email: '',
  contact: '',
  linkedin: '',
  photo: '', // Add photo field for profile image
  summary: '',
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  references: 'Available upon request'
});

// Helper function to extract contact information
const extractContactInfo = (text, resumeData) => {
  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    resumeData.email = emailMatch[0];
    console.log('📄 Found email:', resumeData.email);
  }

  // Extract phone number
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    resumeData.contact = phoneMatch[0];
    console.log('📄 Found phone:', resumeData.contact);
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/(linkedin\.com\/in\/[^\s]+|linkedin\.com\/[^\s]+)/i);
  if (linkedinMatch) {
    resumeData.linkedin = linkedinMatch[0];
    if (!resumeData.linkedin.startsWith('http')) {
      resumeData.linkedin = 'https://' + resumeData.linkedin;
    }
    console.log('📄 Found LinkedIn:', resumeData.linkedin);
  }
};

// Helper function to finalize resume data
const finalizeResumeData = (resumeData) => {
  // Ensure at least one work experience and education entry
  if (resumeData.workExperience.length === 0) {
    resumeData.workExperience.push({
      title: '',
      company: '',
      duration: '',
      responsibilities: ''
    });
  }

  if (resumeData.education.length === 0) {
    resumeData.education.push({
      degree: '',
      university: '',
      year: ''
    });
  }

  // Clean up and deduplicate skills
  resumeData.skills = Array.isArray(resumeData.skills) ? [...new Set(resumeData.skills)] : [];
  resumeData.certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];

  console.log('📄 Final parsed resume data:', {
    name: resumeData.name,
    email: resumeData.email,
    contact: resumeData.contact,
    linkedin: resumeData.linkedin,
    workExperience: resumeData.workExperience.length,
    education: resumeData.education.length,
    skills: resumeData.skills.length,
    certifications: resumeData.certifications.length,
    summary: resumeData.summary ? 'Present' : 'Not found'
  });

  return resumeData;
};

// Helper function to process section content
function processSection(sectionType, content, resumeData) {
  console.log(`📄 Processing section: ${sectionType}`, content);
  
  switch (sectionType) {
    case 'summary':
      resumeData.summary = content.join(' ').replace(/\s+/g, ' ').trim();
      console.log(`📄 Summary processed:`, resumeData.summary);
      break;
      
    case 'experience':
      parseWorkExperience(content, resumeData);
      console.log(`📄 Work experience processed, total jobs:`, resumeData.workExperience.length);
      break;
      
    case 'education':
      parseEducation(content, resumeData);
      console.log(`📄 Education processed, total entries:`, resumeData.education.length);
      break;
      
    case 'skills':
      parseSkills(content, resumeData);
      console.log(`📄 Skills processed, total skills:`, resumeData.skills.length);
      break;
      
    case 'certifications':
      // Ensure certifications is an array
      if (!Array.isArray(resumeData.certifications)) {
        resumeData.certifications = [];
      }
      resumeData.certifications = [...resumeData.certifications, ...content];
      console.log(`📄 Certifications processed:`, resumeData.certifications);
      break;
      
    case 'references':
      resumeData.references = content.join(' ').trim() || 'Available upon request';
      console.log(`📄 References processed:`, resumeData.references);
      break;
  }
}

// Parse work experience section
function parseWorkExperience(content, resumeData) {
  console.log('📄 Parsing work experience from:', content);
  
  // Ensure workExperience is an array
  if (!Array.isArray(resumeData.workExperience)) {
    resumeData.workExperience = [];
  }
  
  let currentJob = null;
  
  for (const line of content) {
    console.log('📄 Processing work line:', line);
    
    // Skip bullet points and responsibilities for now, collect job titles/companies
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      if (currentJob) {
        if (currentJob.responsibilities) {
          currentJob.responsibilities += '\n' + line;
        } else {
          currentJob.responsibilities = line;
        }
      }
      continue;
    }
    
    // Look for job title and company patterns
    if (line.includes(' at ') || line.includes(' | ') || line.includes(' - ')) {
      // Save previous job if exists
      if (currentJob) {
        console.log('📄 Saving job:', currentJob);
        resumeData.workExperience.push(currentJob);
      }
      
      // Parse new job
      const parts = line.split(/\s+(?:at|@|-|\|)\s+/);
      currentJob = {
        title: parts[0]?.trim() || '',
        company: parts[1]?.trim() || '',
        duration: parts[2]?.trim() || '',
        responsibilities: ''
      };
      console.log('📄 Created new job from pattern:', currentJob);
    } else if (line.match(/\b(developer|engineer|analyst|manager|coordinator|specialist|assistant|intern)\b/i) && 
               !line.startsWith('•') && line.length < 100) {
      // This looks like a job title
      if (currentJob) {
        console.log('📄 Saving previous job:', currentJob);
        resumeData.workExperience.push(currentJob);
      }
      
      currentJob = {
        title: line.trim(),
        company: '',
        duration: '',
        responsibilities: ''
      };
      console.log('📄 Created job from title:', currentJob);
    } else if (currentJob && !currentJob.company && line.length < 50 && 
               !line.match(/\d{4}/) && !line.includes('•')) {
      // This might be a company name
      currentJob.company = line.trim();
      console.log('📄 Added company to job:', currentJob);
    } else if (currentJob && line.match(/\d{4}|present|current/i)) {
      // This looks like a date range
      currentJob.duration = line.trim();
      console.log('📄 Added duration to job:', currentJob);
    }
  }
  
  // Add the last job
  if (currentJob) {
    console.log('📄 Saving final job:', currentJob);
    resumeData.workExperience.push(currentJob);
  }
}

// Parse education section
function parseEducation(content, resumeData) {
  console.log('📄 Parsing education from:', content);
  
  // Ensure education is an array
  if (!Array.isArray(resumeData.education)) {
    resumeData.education = [];
  }
  
  let currentEdu = null;
  
  for (const line of content) {
    console.log('📄 Processing education line:', line);
    
    // Skip bullet points and descriptions
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      continue;
    }
    
    // Look for degree patterns
    if (line.match(/\b(bachelor|master|degree|diploma|certificate|phd|doctorate)/i)) {
      if (currentEdu) {
        console.log('📄 Saving education:', currentEdu);
        resumeData.education.push(currentEdu);
      }
      
      currentEdu = {
        degree: line.trim(),
        university: '',
        year: ''
      };
      console.log('📄 Created education from degree:', currentEdu);
    } else if (line.includes(' at ') || line.includes(' | ') || line.includes(' - ')) {
      // Parse degree with university
      const parts = line.split(/\s+(?:at|from|-|\|)\s+/);
      if (currentEdu) {
        console.log('📄 Saving previous education:', currentEdu);
        resumeData.education.push(currentEdu);
      }
      
      currentEdu = {
        degree: parts[0]?.trim() || '',
        university: parts[1]?.trim() || '',
        year: parts[2]?.trim() || ''
      };
      console.log('📄 Created education from pattern:', currentEdu);
    } else if (currentEdu && !currentEdu.university && line.length < 100 && 
               !line.match(/\d{4}/) && 
               (line.toLowerCase().includes('university') || 
                line.toLowerCase().includes('college') || 
                line.toLowerCase().includes('institute') ||
                line.toLowerCase().includes('school'))) {
      // This looks like a university name
      currentEdu.university = line.trim();
      console.log('📄 Added university to education:', currentEdu);
    } else if (currentEdu && line.match(/\b(19|20)\d{2}\b/)) {
      // Extract year
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        currentEdu.year = yearMatch[0];
        console.log('📄 Added year to education:', currentEdu);
      }
    }
  }
  
  // Add the last education entry
  if (currentEdu) {
    console.log('📄 Saving final education:', currentEdu);
    resumeData.education.push(currentEdu);
  }
}

// Parse skills section
function parseSkills(content, resumeData) {
  console.log('📄 Parsing skills from:', content);
  
  // Ensure skills is an array
  if (!Array.isArray(resumeData.skills)) {
    resumeData.skills = [];
  }
  
  const allSkillText = content.join(' ');
  
  // Split by common delimiters
  const skills = allSkillText
    .split(/[,•\n\-\|]/)
    .map(skill => skill.trim())
    .filter(skill => skill.length > 1 && skill.length < 30)
    .filter(skill => !skill.match(/\d{4}/) && !skill.includes('@')); // Remove years and emails
  
  console.log('📄 Extracted skills:', skills);
  resumeData.skills = [...resumeData.skills, ...skills];
}

// ✅ Final export
module.exports = {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  uploadResumeFile
};
