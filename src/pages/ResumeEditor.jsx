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
    
    // Default empty state
    const defaultData = {
      title: '',
      name: '',
      email: '',
      contact: '',
      linkedin: '',
      workExperience: [{ 
        title: '', 
        company: '', 
        duration: '', 
        responsibilities: ''
      }],
      education: [{ 
        degree: '', 
        university: '', 
        year: '' 
      }],
      skills: [],
      certifications: [],
      summary: '',
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
    
    // If we're creating a new resume (no location state), clear localStorage
    if (Object.keys(locationData).length === 0) {
      localStorage.removeItem('resumeData');
      return defaultData;
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Clean and validate the data
      const cleanedData = {
        name: data.name?.trim() || '',
        email: data.email?.trim() || '',
        contact: data.contact?.trim() || '',
        linkedin: data.linkedin?.trim() || '',
        summary: data.summary?.trim() || '',
        references: data.references?.trim() || 'Available upon request',
        workExperience: (data.workExperience || [])
          .filter(exp => exp.title || exp.company || exp.duration || exp.responsibilities)
          .map(exp => ({
            title: exp.title?.trim() || '',
            company: exp.company?.trim() || '',
            duration: exp.duration?.trim() || '',
            responsibilities: exp.responsibilities?.trim() || ''
          })),
        education: (data.education || [])
          .filter(edu => edu.degree || edu.university || edu.year)
          .map(edu => ({
            degree: edu.degree?.trim() || '',
            university: edu.university?.trim() || '',
            year: edu.year?.trim() || ''
          })),
        skills: (data.skills || []).map(skill => skill.trim()),
        certifications: (data.certifications || []).map(cert => cert.trim())
      };

      // Validate required fields
      const missingFields = [];
      if (!cleanedData.name) missingFields.push('Name');
      if (!cleanedData.email) missingFields.push('Email');
      if (!cleanedData.contact) missingFields.push('Contact');

      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      const payload = {
        title: data.title?.trim() || `${cleanedData.name}'s Resume`,
        content: cleanedData,
        template_id: 1
      };

      let response;
      try {
        if (resumeId) {
          // Update existing resume
          response = await api.put(`/resumes/${resumeId}`, payload);
          console.log('✅ Resume updated successfully:', response.data);
        } else {
          // Create new resume
          response = await api.post('/resumes', payload);
          console.log('✅ Resume created successfully:', response.data);
          if (response.data.resumeId) {
            setResumeId(response.data.resumeId);
          }
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2';
        successMessage.innerHTML = `
          <span>✅</span>
          <span>Resume ${resumeId ? 'updated' : 'saved'} successfully!</span>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);

        return true;
      } catch (apiError) {
        console.error('API Error:', apiError.response?.data || apiError.message);
        throw new Error(apiError.response?.data?.message || 'Failed to save resume');
      }
    } catch (err) {
      console.error('Save to database error:', err);
      throw err;
    }
  };

  // Handle save and navigation
  const handleSaveResume = async () => {
    try {
      // Check for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        // Save current resume data to localStorage for retrieval after login
        localStorage.setItem('pendingResumeData', JSON.stringify(resumeData));
        alert('Please log in to save your resume.');
        navigate('/login', { state: { returnTo: '/resume-editor' } });
        return;
      }

      // Validate required fields
      const requiredFields = {
        name: 'Full Name',
        email: 'Email',
        contact: 'Phone Number'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !resumeData[key]?.trim())
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields:\n${missingFields.join('\n')}`);
        return;
      }

      setIsSaving(true);
      const saved = await saveToDatabase(resumeData);
      if (saved) {
        // Create success message element
        const messageId = 'save-success-message';
        const existingMessage = document.getElementById(messageId);
        if (existingMessage) {
          existingMessage.remove();
        }

        const successMessage = document.createElement('div');
        successMessage.id = messageId;
        successMessage.className = 'fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-opacity duration-500';
        successMessage.innerHTML = `
          <span>✅</span>
          <span>Resume saved! Redirecting to preview...</span>
        `;
        document.body.appendChild(successMessage);
        
        // Start fade out animation after 1 second
        setTimeout(() => {
          successMessage.style.opacity = '0';
        }, 1000);

        // Remove message and navigate after fade out
        setTimeout(() => {
          successMessage.remove();
          navigate('/resume-preview', {
            state: {
              ...resumeData,
              id: resumeId
            }
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Save resume error:', err);
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        alert('Your session has expired. Please log in again.');
        // Save current resume data
        localStorage.setItem('pendingResumeData', JSON.stringify(resumeData));
        navigate('/login', { state: { returnTo: '/resume-editor' } });
      } else {
        alert(err.message || 'Failed to save resume. Please try again.');
      }
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
      const res = await api.post('/ai/suggest-skills', { input: value });
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

      const res = await api.post('/ai/enhance-skills', skillData);
      
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
        experience: resumeData.workExperience
          .filter(exp => exp.title && exp.company)
          .map(exp => `${exp.title} at ${exp.company} (${exp.duration}): ${exp.responsibilities}`)
          .join('. '),
        education: resumeData.education[0] ? 
          `${resumeData.education[0].degree} from ${resumeData.education[0].university} (${resumeData.education[0].year})` : '',
        skills: resumeData.skills.join(', '),
        certifications: resumeData.certifications.join(', ')
      };
      
      const res = await api.post('/ai/summary', summaryData);
      
      if (res.data.suggestedSummary) {
        // Clean up the AI response
        let cleanedSummary = res.data.suggestedSummary
          // Remove any introductory phrases
          .replace(/^(here is|here's|this is|summary:|professional summary:|resume summary:)/i, '')
          // Remove quotes and extra spaces
          .replace(/^["'\s]+/, '')
          .replace(/["'\s]+$/, '')
          // Remove any AI commentary
          .replace(/\n.*suggestions.*$/i, '')
          .replace(/\n.*customize.*$/i, '')
          .replace(/\n.*hope this.*$/i, '')
          // Ensure proper spacing
          .replace(/\s+/g, ' ')
          .trim();

        // Ensure it starts with a role/title
        const unwantedStarts = [
          'a professional',
          'an experienced',
          'this candidate',
          'the candidate',
          'the professional'
        ];
        
        for (const phrase of unwantedStarts) {
          if (cleanedSummary.toLowerCase().startsWith(phrase)) {
            cleanedSummary = cleanedSummary.substring(phrase.length).trim();
          }
        }

        // Ensure it ends with a period
        if (!cleanedSummary.endsWith('.')) {
          cleanedSummary += '.';
        }

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

      // Gather context about the position
      const context = {
        title: jobData.title,
        company: jobData.company,
        experience: `${jobData.title} at ${jobData.company} (${jobData.duration || 'Not specified'}): ${jobData.responsibilities || 'None'}`
      };

      const res = await api.post('/ai', context);

      if (res.data.suggestedSummary) {
        // Parse and clean up the AI response
        const suggestions = res.data.suggestedSummary
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            // Skip empty lines and formatting
            if (!trimmed) return false;
            if (trimmed.startsWith('Example')) return false;
            if (trimmed.startsWith('Here')) return false;
            if (trimmed.includes('Guidelines')) return false;
            return true;
          })
          .map(line => {
            // Clean up the text
            let cleaned = line.trim()
              .replace(/^[•\-\+\*]+\s*/, '') // Remove bullet points
              .replace(/^\d+\.\s*/, '') // Remove numbering
              .replace(/^[^a-zA-Z]+/, '') // Remove any leading non-letter characters
              .trim();

            // Ensure first letter is capitalized
            if (cleaned) {
              cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            }

            return cleaned;
          })
          .filter(line => line && line.length >= 10); // Remove empty or very short lines

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
    // Clean up the responsibility text
    let cleanedResponsibility = responsibility
      .replace(/\*\*/g, '') // Remove asterisks
      .trim();

    // Count words
    const wordCount = cleanedResponsibility.split(/\s+/).length;
    if (wordCount > 7) {
      alert('Responsibility is too long. Please keep it to 7 words or less.');
      return;
    }

    const newWorkExperience = [...resumeData.workExperience];
    const currentResponsibilities = newWorkExperience[index].responsibilities || '';
    
    // Add the new responsibility with a bullet point
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${
                      !resumeData.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    value={resumeData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${
                      !resumeData.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    value={resumeData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent ${
                      !resumeData.contact ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                    value={resumeData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="linkedin"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                      placeholder="Your LinkedIn profile URL"
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
              {/* Required Fields Notice */}
              <p className="text-sm text-gray-500 mt-2">
                Fields marked with <span className="text-red-500">*</span> are required
              </p>
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
                          {suggestedResponsibilities[index]
                            .filter(responsibility => {
                              // Additional frontend filtering
                              const cleaned = responsibility.replace(/\*\*/g, '').trim();
                              const wordCount = cleaned.split(/\s+/).length;
                              return (
                                wordCount <= 7 && // Enforce 7-word limit
                                cleaned.length >= 10 && // Ensure minimum length
                                !cleaned.toLowerCase().includes('example') &&
                                !cleaned.toLowerCase().includes('should be') &&
                                !cleaned.includes('*') // Remove any remaining asterisks
                              );
                            })
                            .map((responsibility, respIndex) => (
                              <button
                                key={respIndex}
                                type="button"
                                onClick={() => addResponsibility(responsibility, index)}
                                className="px-3 py-1 bg-white border border-green-500 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors flex items-center space-x-1"
                              >
                                <span>+</span>
                                <span>{responsibility.replace(/\*\*/g, '')}</span>
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

            {/* Skills Section - Moved here */}
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
                    {suggestedSkills.map((skill, index) => {
                      // Clean the skill string by removing numbers, periods, and special characters
                      const cleanedSkill = skill
                        .replace(/^\d+\.\s*/, '') // Remove numbers and periods from start
                        .replace(/[\[\]"']/g, '') // Remove quotes and brackets
                        .trim();
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addSkill(cleanedSkill);
                            setSuggestedSkills(prev => prev.filter(s => s !== skill));
                          }}
                          className="px-3 py-1 bg-white border border-green-500 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors flex items-center space-x-1"
                        >
                          <span>+</span>
                          <span>{cleanedSkill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Certifications Section - Moved here */}
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
