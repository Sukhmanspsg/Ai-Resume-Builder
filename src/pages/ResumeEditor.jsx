import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { calculateATSScore, getScoreColor, getScoreMessage } from '../utils/atsScoring';

const ResumeEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resumeId, setResumeId] = useState(location.state?.id || null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get initial data from location state or local storage
  const getInitialData = () => {
    const savedData = localStorage.getItem('resumeData');
    const locationData = location.state || {};
    
    // Default empty state with sample data
    const defaultData = {
      title: 'Student Mentor Resume',
      name: 'Sukhmanpreet Singh',
      email: 'sukhman29spsg@gmail.com',
      contact: '0426167301',
      linkedin: 'https://www.linkedin.com/in/sukhmanpreet-singh-93b72118a/',
      workExperience: [{ 
        title: 'Student Mentor', 
        company: 'Victoria University (VU)', 
        duration: '2020 - 2024', 
        responsibilities: `• Provided comprehensive academic support and guidance to a diverse group of 20+ students per semester, resulting in an average 15% improvement in academic performance
• Facilitated weekly one-on-one mentoring sessions to help students develop effective study strategies, time management skills, and academic goals
• Collaborated with faculty members and academic advisors to identify and support students facing academic challenges
• Created and maintained detailed progress reports for each mentee, tracking their academic development and areas for improvement
• Organized and led bi-weekly study groups and workshops on topics such as exam preparation, research methods, and academic writing
• Developed and implemented personalized learning plans for students with diverse learning styles and needs
• Served as a liaison between students and faculty, helping to resolve academic concerns and facilitate effective communication
• Maintained 95% positive feedback rating from mentees through consistent support and guidance
• Actively participated in mentor training programs and professional development workshops to enhance mentoring skills`
      }],
      education: [{ 
        degree: 'Bachelor of Information Technology', 
        university: 'Victoria University', 
        year: '2025' 
      }],
      skills: [
        'Academic Mentoring',
        'Student Support',
        'Time Management',
        'Communication',
        'Problem-Solving',
        'Leadership',
        'Conflict Resolution',
        'Program Development',
        'Data Analysis',
        'Team Collaboration'
      ],
      certifications: ['C++'],
      summary: `Results-driven Student Mentor with 4 years of experience providing comprehensive academic support and guidance at Victoria University. Demonstrated success in improving student academic performance through personalized mentoring, effective study strategies, and strong communication skills. Proven track record of developing and implementing successful learning plans for diverse student populations. Skilled in fostering a positive learning environment while maintaining high standards of academic integrity and student success. Committed to continuous improvement and professional development in student mentoring and academic support services.`,
      references: 'Available upon request'
    };
    
    // If we have data in location state (coming back from preview), use that
    if (Object.keys(locationData).length > 0) {
      const mergedData = {
        ...defaultData,
        ...locationData,
        // Ensure arrays are initialized even if they don't exist in locationData
        workExperience: locationData.workExperience || defaultData.workExperience,
        education: locationData.education || defaultData.education,
        skills: locationData.skills || defaultData.skills,
        certifications: locationData.certifications || defaultData.certifications
      };
      localStorage.setItem('resumeData', JSON.stringify(mergedData));
      return mergedData;
    }
    
    // If we have saved data in localStorage, use that
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        return {
          ...defaultData,
          ...parsedData,
          // Ensure arrays are initialized even if they don't exist in saved data
          workExperience: parsedData.workExperience || defaultData.workExperience,
          education: parsedData.education || defaultData.education,
          skills: parsedData.skills || defaultData.skills,
          certifications: parsedData.certifications || defaultData.certifications
        };
      } catch (e) {
        console.error('Error parsing saved resume data:', e);
        return defaultData;
      }
    }
    
    // If no saved data, return default empty state
    return defaultData;
  };

  const [resumeData, setResumeData] = useState(getInitialData);
  const [isCalculatingATS, setIsCalculatingATS] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [enhancingJobIndex, setEnhancingJobIndex] = useState(null);
  const [suggestedResponsibilities, setSuggestedResponsibilities] = useState({});

  // Debounced ATS score calculation
  const debouncedATSScore = useCallback(
    debounce(async (data) => {
      try {
        setIsCalculatingATS(true);
        // Calculate score locally instead of API call
        const score = calculateATSScore(data);
        setAtsScore(score);
      } catch (err) {
        console.error('❌ ATS scoring failed', err);
        setAtsScore(0);
      } finally {
        setIsCalculatingATS(false);
      }
    }, 1000),
    []
  );

  // Function to save/update resume in database
  const saveToDatabase = async (data) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You're not logged in. Please log in to save your resume.");
        navigate('/login');
        return false;
      }

      const decoded = jwtDecode(token);
      const user_id = decoded.id;

      const content = {
        ...data,
        workExperience: data.workExperience.filter(exp => 
          exp.title || exp.company || exp.duration || exp.responsibilities
        ),
        education: data.education.filter(edu => 
          edu.degree || edu.university || edu.year
        )
      };

      const payload = {
        user_id,
        title: data.title,
        content: JSON.stringify(content),
        template_id: 1
      };

      let response;
      if (resumeId) {
        // Update existing resume
        response = await api.put(`/api/resumes/${resumeId}`, payload, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new resume
        response = await api.post('/api/resumes', payload, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data.resumeId) {
          setResumeId(response.data.resumeId);
        }
      }

      return true;
    } catch (err) {
      console.error('Save resume error:', err);
      alert(err.response?.data?.message || 'Failed to save resume. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function for auto-saving changes
  const debouncedSave = useCallback(
    debounce(async (data) => {
      await saveToDatabase(data);
    }, 2000),
    [resumeId]
  );

  // Effect for auto-save and ATS score calculation
  useEffect(() => {
    if (Object.keys(resumeData).length > 0) {
      // Save to local storage and database
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      debouncedSave(resumeData);

      // Calculate ATS score
      if (resumeData.name || resumeData.workExperience[0].title || resumeData.skills.length) {
        debouncedATSScore(resumeData);
      }
    }
  }, [resumeData, debouncedSave, debouncedATSScore]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
  };

  // Live skill suggestions using AI (autocomplete-style)
  const handleSkillInputChange = async (e) => {
    const value = e.target.value;
    setSkillInput(value);
    try {
      const res = await api.post('/api/ai/suggest-skills', { input: value });
      setSuggestedSkills(res.data.suggestions || []);
    } catch {
      setSuggestedSkills([]);
    }
  };

  // Add selected skill to resume
  const addSkill = (skill) => {
    if (!resumeData.skills.includes(skill)) {
      setResumeData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  // Remove skill from resume
  const removeSkill = (skill) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill)
    }));
  };

  // Use AI to enhance skill section based on current experience/education
  const handleAIEnhanceSkills = async () => {
    try {
      // Show loading state
      setSuggestedSkills(['Loading...']);

      // Prepare comprehensive data for AI analysis
      const skillData = {
        workExperience: resumeData.workExperience
          .filter(exp => exp.title || exp.company || exp.responsibilities)
          .map(exp => ({
            title: exp.title,
            company: exp.company,
            responsibilities: exp.responsibilities
          })),
        education: resumeData.education
          .filter(edu => edu.degree || edu.university)
          .map(edu => ({
            degree: edu.degree,
            university: edu.university,
            year: edu.year
          })),
        currentSkills: resumeData.skills || []
      };

      // Validate if we have enough data to make suggestions
      if (skillData.workExperience.length === 0 && skillData.education.length === 0) {
        setSuggestedSkills([]);
        alert('Please add some work experience or education details to get skill suggestions.');
        return;
      }

      const res = await api.post('/api/ai/enhance-skills', skillData);
      
      if (res.data.enhancedSkills && Array.isArray(res.data.enhancedSkills)) {
        // Filter out skills that are already in the resume
        const newSkills = res.data.enhancedSkills.filter(
          skill => !resumeData.skills.includes(skill)
        );
        
        if (newSkills.length > 0) {
          setSuggestedSkills(newSkills);
        } else if (resumeData.skills.length === 0) {
          // If no current skills, suggest the original enhanced skills
          setSuggestedSkills(res.data.enhancedSkills);
        } else {
          setSuggestedSkills([]);
          alert('No new skills to suggest. Your current skills list looks comprehensive!');
        }
      } else {
        setSuggestedSkills([]);
        throw new Error('Invalid response format from AI service');
      }
    } catch (err) {
      console.error('❌ Skill enhancement failed:', err);
      setSuggestedSkills([]);
      if (err.response?.data?.error?.code === 'rate_limit_exceeded') {
        alert('AI service is temporarily busy. Please try again in a few seconds.');
      } else {
        alert('Could not enhance skills with AI. Please try again.');
      }
    }
  };

  // Use AI to generate a professional summary
  const handleAISummary = async () => {
    try {
      const summaryData = {
        name: resumeData.name,
        education: resumeData.education[0] ? 
          `${resumeData.education[0].degree} from ${resumeData.education[0].university} (${resumeData.education[0].year})` : '',
        experience: resumeData.workExperience
          .filter(exp => exp.title && exp.company)
          .map(exp => `${exp.title} at ${exp.company} (${exp.duration}): ${exp.responsibilities}`)
          .join('. '),
        skills: resumeData.skills.join(', '),
        certifications: resumeData.certifications.join(', ')
      };
      
      const prompt = `📌 Instructions to Generate Resume Summary:
      Generate a BRIEF professional resume summary (2-5 lines MAXIMUM, separated by periods).

      Available Information:
      - Current Role: ${summaryData.experience || 'N/A'}
      - Education: ${summaryData.education || 'N/A'}
      - Skills: ${summaryData.skills || 'N/A'}
      - Certifications: ${summaryData.certifications || 'N/A'}

      STRICT FORMATTING RULES:
      - MUST be between 2-5 lines total
      - Each line should end with a period
      - Start directly with content (no introductions)
      - NO headers, formatting, or symbols
      - NO phrases like "Here's a summary" or "Feel free to modify"
      - Keep each line focused and concise
      - Use present tense for current roles
      
      Example of GOOD format (3 lines):
      Results-driven Student Mentor with 4 years of experience in academic support and program development. Demonstrated expertise in improving student performance through personalized mentoring and workshop facilitation. Seeking to leverage mentoring and leadership skills while driving educational excellence.

      Example of BAD format (too long):
      Results-driven Student Mentor with extensive experience in academic support and program development. Demonstrated expertise in improving student performance through personalized mentoring and workshop facilitation. Proven track record of developing and implementing successful learning plans for diverse student populations. Skilled in fostering a positive learning environment while maintaining high standards of academic integrity. Committed to continuous improvement and professional development in student mentoring. Seeking to leverage mentoring and leadership skills while driving educational excellence.`;
      
      const res = await api.post('/api/ai', summaryData);
      
      if (res.data.suggestedSummary) {
        // Clean up the AI response
        let cleanedSummary = res.data.suggestedSummary
          .replace(/^Here['']s.*?:\s*/i, '')
          .replace(/^Based on.*?:\s*/i, '')
          .replace(/^\*\*Summary:\*\*\s*/i, '')
          .replace(/^Summary:\s*/i, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/Feel free.*$/, '')
          .replace(/You can customize.*$/, '')
          .replace(/I hope this helps.*$/, '')
          .trim();

        // Remove unwanted starting phrases
        const unwantedStarts = [
          'This summary', 'A professional', 'This professional',
          'Here is', 'This is', 'The following'
        ];
        
        for (const phrase of unwantedStarts) {
          if (cleanedSummary.toLowerCase().startsWith(phrase.toLowerCase())) {
            cleanedSummary = cleanedSummary.substring(phrase.length).trim();
          }
        }

        // Enforce line limit
        let lines = cleanedSummary
          .split(/[.!?]+/)
          .map(line => line.trim())
          .filter(line => line.length > 0);

        // Keep only 2-5 lines
        if (lines.length > 5) {
          lines = lines.slice(0, 5);
        } else if (lines.length < 2) {
          throw new Error('Summary too short');
        }

        // Reconstruct summary with proper punctuation
        cleanedSummary = lines.join('. ') + '.';

        setResumeData(prev => ({
          ...prev,
          summary: cleanedSummary
        }));
      } else {
        throw new Error('No summary generated');
      }
    } catch (err) {
      console.error('❌ Summary generation failed:', err);
      alert('Could not generate summary with AI. Please try again.');
    }
  };

  // Handle save and navigation
  const handleSaveResume = async () => {
    try {
      if (!resumeData.title || !resumeData.name || !resumeData.email || !resumeData.contact) {
        alert('Please fill in all required fields (Title, Name, Email, and Contact)');
        return;
      }

      const saved = await saveToDatabase(resumeData);
      if (saved) {
        navigate('/resume-preview', {
          state: {
            ...resumeData,
            id: resumeId
          }
        });
      }
    } catch (err) {
      console.error('Save resume error:', err);
      alert(err.response?.data?.message || 'Failed to save resume. Please try again.');
    }
  };

  // Effect to trigger ATS score calculation when relevant fields change
  useEffect(() => {
    if (resumeData.name || resumeData.workExperience[0].title || resumeData.skills.length) {
      debouncedATSScore(resumeData);
    }
    
    // Cleanup debounce on unmount
    return () => {
      debouncedATSScore.cancel();
    };
  }, [resumeData, debouncedATSScore]);

  // Function to enhance job description with AI
  const handleEnhanceJobDescription = async (index) => {
    try {
      setEnhancingJobIndex(index);
      const jobData = resumeData.workExperience[index];

      if (!jobData.title || !jobData.company) {
        alert('Please fill in the job title and company name first.');
        return;
      }

      const prompt = `Generate 12-15 different possible job responsibilities for the position of ${jobData.title} at ${jobData.company}.
      Current responsibilities: ${jobData.responsibilities || 'None'}
      Duration: ${jobData.duration || 'Not specified'}
      Education: ${resumeData.education[0]?.degree || ''}
      
      IMPORTANT: Generate ONLY responsibilities, no headers, no formatting, no summaries.
      
      Each responsibility should:
      • Be EXTREMELY concise (5-7 words maximum)
      • Start with a strong action verb
      • Include specific metrics when possible
      • Be direct and impactful
      • Focus on key achievements
      • NO headers or sections
      • NO formatting or symbols
      • NO education or experience summaries
      
      Examples of good format:
      Mentored 20 students to success
      Increased team productivity by 40%
      Led five successful project launches
      Managed $500K annual budget
      
      BAD examples (DO NOT generate these):
      + Education:
      + Experience:
      ** Job Title **
      Summary:
      
      Generate ONLY responsibilities, one per line.`;

      const res = await api.post('/api/ai', {
        experience: `${jobData.title} at ${jobData.company}`,
        education: resumeData.education[0]?.degree || '',
        skills: prompt
      });

      if (res.data.suggestedSummary) {
        // Parse and clean up the AI response
        const suggestions = res.data.suggestedSummary
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            // Skip lines that look like headers or formatting
            if (!trimmed) return false;
            if (trimmed.startsWith('+')) return false;
            if (trimmed.startsWith('**')) return false;
            if (trimmed.startsWith('Education:')) return false;
            if (trimmed.startsWith('Experience:')) return false;
            if (trimmed.startsWith('Summary:')) return false;
            if (trimmed.includes('(20')) return false; // Skip date ranges
            if (/^\d{4}$/.test(trimmed)) return false; // Skip year numbers
            if (trimmed.match(/^[A-Za-z]+ of [A-Za-z]+/)) return false; // Skip degree titles
            return true;
          })
          .map(line => {
            // Clean up the text
            let cleaned = line.trim()
              .replace(/^[•\-\+\*]+\s*/, '') // Remove bullet points
              .replace(/^\*\*.*?\*\*/, '') // Remove bold text
              .replace(/^Here is.*?:/, '') // Remove intros
              .replace(/^As a.*?:/, '') // Remove role intros
              .replace(/Notable achievements include:/, '') // Remove headers
              .replace(/^[A-Za-z]+ of [A-Za-z]+.*$/, '') // Remove degree lines
              .replace(/\([^)]*\)/g, '') // Remove parentheses and their content
              .replace(/^\d{4}(-\d{4})?:?/, '') // Remove year ranges
              .trim();

            // Ensure it starts with an action verb
            if (cleaned && !/^[A-Z][a-z]+ed?\s/.test(cleaned)) {
              return null;
            }

            // Ensure first letter is capitalized
            if (cleaned) {
              cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            }

            // Count words and validate length
            const wordCount = cleaned.split(/\s+/).length;
            return (wordCount >= 3 && wordCount <= 7) ? cleaned : null;
          })
          .filter(Boolean); // Remove null values

        // Store suggestions with the job index
        setSuggestedResponsibilities(prev => ({
          ...prev,
          [index]: suggestions
        }));
      } else {
        throw new Error('No suggestions received from AI');
      }
    } catch (err) {
      console.error('Job description enhancement error:', err);
      setSuggestedResponsibilities(prev => ({
        ...prev,
        [index]: []
      }));
      if (err.response?.status === 429) {
        alert('AI service is temporarily busy. Please wait a few seconds and try again.');
      } else if (err.response?.status === 401) {
        alert('Authentication error. Please check if your API key is configured correctly.');
      } else {
        alert('Could not generate suggestions. Please try again or contact support if the issue persists.');
      }
    } finally {
      setEnhancingJobIndex(null);
    }
  };

  // Function to add a responsibility to the job description
  const addResponsibility = (responsibility, index) => {
    const newWorkExperience = [...resumeData.workExperience];
    const currentResponsibilities = newWorkExperience[index].responsibilities || '';
    
    // Add the new responsibility with a bullet point, ensuring it's clean
    const cleanedResponsibility = responsibility
      .replace(/^[•\-\+\*]+\s*/, '')
      .trim();
    
    // Verify word count before adding
    const wordCount = cleanedResponsibility.split(/\s+/).length;
    if (wordCount > 7) {
      alert('Responsibility is too long. Please keep it to 7 words or less.');
      return;
    }
    
    newWorkExperience[index].responsibilities = currentResponsibilities
      ? `${currentResponsibilities}\n• ${cleanedResponsibility}`
      : `• ${cleanedResponsibility}`;
    
    setResumeData(prev => ({
      ...prev,
      workExperience: newWorkExperience
    }));
    
    // Remove the used suggestion from the list
    setSuggestedResponsibilities(prev => ({
      ...prev,
      [index]: prev[index].filter(sugg => sugg !== responsibility)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Resume Input Form</h1>
          </div>

          {/* Skills Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#1a237e]/10 text-[#1a237e] rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      className="ml-2 text-[#1a237e] hover:text-[#1a237e]/70"
                      onClick={(e) => {
                        e.preventDefault();
                        removeSkill(skill);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && skillInput.trim()) {
                      e.preventDefault();
                      addSkill(skillInput.trim());
                      setSkillInput('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90 flex items-center space-x-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAIEnhanceSkills();
                  }}
                  disabled={suggestedSkills.includes('Loading...')}
                >
                  {suggestedSkills.includes('Loading...') ? (
                    <>
                      <span className="animate-spin">↻</span>
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Enhance Skills with AI'
                  )}
                </button>
              </div>
              {/* Display AI Suggested Skills */}
              {suggestedSkills.length > 0 && !suggestedSkills.includes('Loading...') && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Suggested Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addSkill(skill);
                          setSuggestedSkills(prev => prev.filter(s => s !== skill));
                        }}
                        className="px-3 py-1 bg-white border border-green-500 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors flex items-center space-x-1"
                      >
                        <span>+</span>
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certifications Section - Moved outside form */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#1a237e]/10 text-[#1a237e] rounded-full text-sm flex items-center"
                  >
                    {cert}
                    <button
                      type="button"
                      className="ml-2 text-[#1a237e] hover:text-[#1a237e]/70"
                      onClick={(e) => {
                        e.preventDefault();
                        setResumeData(prev => ({
                          ...prev,
                          certifications: prev.certifications.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Add Certification"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && certInput.trim()) {
                      e.preventDefault();
                      if (!resumeData.certifications.includes(certInput.trim())) {
                        setResumeData(prev => ({
                          ...prev,
                          certifications: [...prev.certifications, certInput.trim()]
                        }));
                        setCertInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90"
                  onClick={(e) => {
                    e.preventDefault();
                    if (certInput.trim() && !resumeData.certifications.includes(certInput.trim())) {
                      setResumeData(prev => ({
                        ...prev,
                        certifications: [...prev.certifications, certInput.trim()]
                      }));
                      setCertInput('');
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveResume();
            }} 
            className="p-6 space-y-8"
          >
            {/* Resume Title */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Resume Title</h2>
              <input
                type="text"
                name="title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                placeholder="Enter resume title"
                value={resumeData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Full Name"
                  value={resumeData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Email"
                  value={resumeData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="tel"
                  name="contact"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Phone Number"
                  value={resumeData.contact}
                  onChange={handleChange}
                  required
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="linkedin"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="LinkedIn URL"
                    value={resumeData.linkedin}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90"
                  >
                    Fill From LinkedIn
                  </button>
                </div>
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
              {resumeData.workExperience.map((exp, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...resumeData.workExperience];
                      newExp[index].title = e.target.value;
                      setResumeData({ ...resumeData, workExperience: newExp });
                    }}
                  />
                  <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...resumeData.workExperience];
                      newExp[index].company = e.target.value;
                      setResumeData({ ...resumeData, workExperience: newExp });
                    }}
                  />
                  <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Period (e.g., 2020 to 2024)"
                    value={exp.duration}
                    onChange={(e) => {
                      const newExp = [...resumeData.workExperience];
                      newExp[index].duration = e.target.value;
                      setResumeData({ ...resumeData, workExperience: newExp });
                    }}
                  />
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Job Description</label>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm bg-[#1a237e] text-white rounded hover:bg-[#1a237e]/90 transition-colors flex items-center space-x-1 disabled:opacity-50"
                        onClick={() => handleEnhanceJobDescription(index)}
                        disabled={enhancingJobIndex === index}
                      >
                        {enhancingJobIndex === index ? (
                          <>
                            <span className="animate-spin">↻</span>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Suggest Responsibilities</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                      placeholder="Describe your responsibilities and achievements..."
                      rows="4"
                      value={exp.responsibilities}
                      onChange={(e) => {
                        const newExp = [...resumeData.workExperience];
                        newExp[index].responsibilities = e.target.value;
                        setResumeData({ ...resumeData, workExperience: newExp });
                      }}
                    />
                    
                    {/* Display AI Suggested Responsibilities */}
                    {suggestedResponsibilities[index]?.length > 0 && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Responsibilities:</h3>
                        <div className="flex flex-wrap gap-2">
                          {suggestedResponsibilities[index].map((responsibility, respIndex) => (
                            <button
                              key={respIndex}
                              type="button"
                              onClick={() => addResponsibility(responsibility, index)}
                              className="px-3 py-1 bg-white border border-green-500 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors flex items-center space-x-1"
                            >
                              <span>+</span>
                              <span>{responsibility}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {enhancingJobIndex === index && (!suggestedResponsibilities[index] || suggestedResponsibilities[index].length === 0) && (
                      <div className="text-sm text-gray-500 animate-pulse">
                        Generating suggestions...
                      </div>
                    )}
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      className="md:col-span-2 px-3 py-1 text-red-600 hover:text-red-700 text-sm flex items-center justify-center space-x-1"
                      onClick={() => {
                        const newExp = resumeData.workExperience.filter((_, i) => i !== index);
                        setResumeData({ ...resumeData, workExperience: newExp });
                      }}
                    >
                      <span>×</span>
                      <span>Remove Position</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#1a237e] hover:text-[#1a237e] transition-colors"
                onClick={() => setResumeData({
                  ...resumeData,
                  workExperience: [...resumeData.workExperience, { title: '', company: '', duration: '', responsibilities: '' }]
                })}
              >
                + Add Work Experience
              </button>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Education</h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].degree = e.target.value;
                      setResumeData({ ...resumeData, education: newEdu });
                    }}
                  />
                  <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Institution"
                    value={edu.university}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].university = e.target.value;
                      setResumeData({ ...resumeData, education: newEdu });
                    }}
                  />
                  <input
                    type="text"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Year"
                    value={edu.year}
                    onChange={(e) => {
                      const newEdu = [...resumeData.education];
                      newEdu[index].year = e.target.value;
                      setResumeData({ ...resumeData, education: newEdu });
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#1a237e] hover:text-[#1a237e] transition-colors"
                onClick={() => setResumeData({
                  ...resumeData,
                  education: [...resumeData.education, { degree: '', university: '', year: '' }]
                })}
              >
                + Add Education
              </button>
            </div>

            {/* Summary Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Professional Summary</h2>
              <div className="relative">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">📌 Summary Guidelines:</h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>Keep it brief (2-5 lines maximum)</li>
                    <li>Start with current role or educational background</li>
                    <li>Include 2-3 key skills relevant to the job</li>
                    <li>Highlight relevant experience or achievements</li>
                    <li>End with career goal or value statement</li>
                  </ul>
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  rows="4"
                  placeholder="Write a brief professional summary (2-5 lines)..."
                  value={resumeData.summary}
                  onChange={handleChange}
                  name="summary"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90 text-sm flex items-center space-x-2"
                  onClick={handleAISummary}
                >
                  <span>✨</span>
                  <span>Generate Summary</span>
                </button>
              </div>
            </div>

            {/* References */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">References</h2>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                rows="4"
                placeholder="Include references here (if any)"
                value={resumeData.references}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full p-4 bg-[#1a237e] text-white rounded-lg hover:bg-[#1a237e]/90 font-medium text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Generate Resume
              </button>
            </div>
          </form>
        </div>

        {/* AI Feedback Panel */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live AI Feedback Panel:</h2>
          <div className="space-y-2">
            <p className="text-gray-600">Highlights ATS-optimized suggestions.</p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">ATS Compliance:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getScoreColor(atsScore)} rounded-full h-2 transition-all duration-300`} 
                  style={{ width: `${atsScore}%` }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${atsScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>{atsScore}%</span>
                {isCalculatingATS && (
                  <span className="text-sm text-gray-500">
                    Calculating...
                  </span>
                )}
              </div>
            </div>
            <p className={`text-sm ${atsScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
              {getScoreMessage(atsScore)}
            </p>

            {/* Quick Tips Based on Score */}
            {atsScore < 80 && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Quick Tips to Improve:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {!resumeData.summary?.includes('years of experience') && (
                    <li>• Add your years of experience to the summary</li>
                  )}
                  {resumeData.skills?.length < 8 && (
                    <li>• Add more relevant skills (aim for 8-12)</li>
                  )}
                  {resumeData.workExperience?.some(exp => !exp.responsibilities?.match(/\d+/)) && (
                    <li>• Include more metrics and numbers in your work experience</li>
                  )}
                  {!resumeData.linkedin && (
                    <li>• Add your LinkedIn profile URL</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <span className="animate-spin">↻</span>
          <span>Saving changes...</span>
        </div>
      )}
    </div>
  );
};

export default ResumeEditor;
