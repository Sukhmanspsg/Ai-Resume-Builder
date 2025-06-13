import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Tab, TabStopPosition, TabStopType } from 'docx';
import FeedbackPopup from '../components/FeedbackPopup';
import { calculateATSScore, generatePersonalizedSuggestions, getScoreColor, getScoreMessage } from '../utils/atsScoring';

const ResumePreview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(state);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [templateHtml, setTemplateHtml] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // Get template from state or default to template ID 1
  const selectedTemplate = state?.selectedTemplate || 1;
  const selectedColor = state?.selectedColor || '#1A237E';
  const useDatabase = state?.useDatabase !== false; // Re-enable database templates with fallback protection

  // Redirect if no resume data
  useEffect(() => {
    if (!resumeData) {
      alert('No resume data found');
      navigate('/editor');
    }
  }, [resumeData, navigate]);

  // Load template from database and render with resume data
  useEffect(() => {
    const loadTemplate = async () => {
      if (!resumeData) return;
      
      console.log('🎨 Loading template...', { 
        selectedTemplate, 
        useDatabase, 
        resumeData: !!resumeData,
        hasResumeId: !!resumeData.id,
        hasPhoto: !!resumeData.photo,
        photoLength: resumeData.photo?.length
      });
      
      // Always show fallback template immediately
      let fallbackHtml = createFallbackHtml(resumeData, selectedColor);
      
      // If using photo template, inject photo into fallback as well
      // For fallback, assume it's a photo template if we have photo data
      const isPhotoTemplate = !!resumeData.photo;
      if (resumeData.photo && isPhotoTemplate) {
        console.log('📸 Injecting photo into fallback template');
        fallbackHtml = fallbackHtml.replace(/\{\{photo\}\}/g, resumeData.photo);
      }
      
      console.log('✅ Setting fallback template');
      setTemplateHtml(fallbackHtml);
      setLoadingTemplate(false);
      
      // If not using database templates, stop here
      if (!useDatabase) {
        console.log('🚫 Not using database templates, keeping fallback');
        return;
      }
      
      try {
        console.log('🔄 Attempting to load database template...', selectedTemplate);
        
        // Try to load database template in the background
        let resumeId = resumeData.id;
        if (!resumeId) {
          console.log('📝 Creating temporary resume entry...');
          // Create temporary resume entry (without photo to avoid database issues)
          const resumeDataForDB = { ...resumeData };
          delete resumeDataForDB.photo; // Remove photo from database storage
          
          const tempResumeResponse = await api.post('/resumes/temporary', {
            name: resumeData.name || 'Temporary Resume',
            content: resumeDataForDB
          });
          resumeId = tempResumeResponse.data.resumeId;
          console.log('✅ Temporary resume created:', resumeId);
        }

        // First, try to get the template data to ensure backend is working
        try {
          const templateCheck = await axios.get(`http://localhost:5000/api/templates/${selectedTemplate}`, {
            timeout: 5000
          });
          console.log('📋 Template data received:', { 
            templateId: templateCheck.data?.id, 
            hasHtmlCode: !!templateCheck.data?.html_code,
            htmlLength: templateCheck.data?.html_code?.length 
          });
        } catch (error) {
          console.error('❌ Failed to fetch template data:', error.message);
          console.log('🔄 Backend may not be running correctly, keeping fallback template');
          return;
        }

        // Get rendered template HTML from backend
        console.log('🌐 Fetching template from backend...', { selectedTemplate, resumeId });
        
        const response = await axios.get(`http://localhost:5000/api/templates/render/${selectedTemplate}`, {
          params: {
            resumeId: resumeId,
            primaryColor: selectedColor
          },
          timeout: 10000 // 10 second timeout
        });

        console.log('📥 Database template response:', { 
          hasData: !!response.data, 
          dataLength: response.data?.length || 0,
          dataType: typeof response.data,
          preview: response.data?.substring(0, 200) + '...',
          templateId: selectedTemplate
        });

        // Only update if we got a valid, substantial response (should be at least as long as fallback)
        if (response.data && typeof response.data === 'string' && response.data.trim().length > 3000) {
          console.log('✅ Using database template', selectedTemplate);
          
          // Inject photo data from frontend state into the template HTML (only for photo templates)
          let templateWithPhoto = response.data;
          // Check if this is a photo template by checking if HTML contains photo elements
          const isPhotoTemplate = templateWithPhoto.includes('profilePhoto') || 
                                   templateWithPhoto.includes('photo-section') || 
                                   templateWithPhoto.includes('{{photo}}');
          
          if (resumeData.photo && isPhotoTemplate) {
            console.log('📸 Injecting photo data from frontend state into photo template');
            templateWithPhoto = templateWithPhoto.replace(/\{\{photo\}\}/g, resumeData.photo);
            
            // Also inject script to show photo immediately after DOMContentLoaded
            templateWithPhoto = templateWithPhoto.replace(
              '</script>',
              `
                // Frontend photo injection - executed after existing initialization
                setTimeout(function() {
                  const frontendPhotoElement = document.getElementById('profilePhoto');
                  const frontendPlaceholderElement = document.getElementById('photoPlaceholder');
                  if (frontendPhotoElement && frontendPlaceholderElement && '${resumeData.photo}') {
                    frontendPhotoElement.src = '${resumeData.photo}';
                    frontendPhotoElement.style.display = 'block';
                    frontendPlaceholderElement.style.display = 'none';
                    console.log('📸 Photo displayed from frontend state');
                  }
                }, 100);
              </script>`
            );
          } else if (isPhotoTemplate && !resumeData.photo) {
            console.log('📝 Photo template without photo - showing placeholder');
            // For photo templates without photo, show placeholder
            templateWithPhoto = templateWithPhoto.replace(/\{\{photo\}\}/g, '');
          } else {
            console.log('📄 Using no-photo template - clean layout');
            // For no-photo templates, no photo injection needed
          }
          
          setTemplateHtml(templateWithPhoto);
        } else {
          console.log('⚠️ Database template too short or invalid, keeping fallback. Template ID:', selectedTemplate);
          console.log('Response preview:', response.data?.substring(0, 500));
        }
      } catch (error) {
        console.error('❌ Error loading template from database:', error.message);
        console.log('🔄 Keeping fallback template for template ID:', selectedTemplate);
        // Explicitly ensure fallback template is still set
        setTemplateHtml(fallbackHtml);
      }
    };

    loadTemplate();
  }, [resumeData, selectedTemplate, selectedColor, useDatabase]);

  // Fallback HTML generator
  const createFallbackHtml = (resume, primaryColor) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resume.name} - Resume</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0;
            padding: 15px;
            line-height: 1.4;
            color: #333;
            background: #f8f9fa;
            font-size: 14px;
          }
          .resume-container {
            background: white;
            max-width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            margin: 0 auto;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center; 
            margin-bottom: 25px; 
            background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD);
            color: white;
            padding: 20px;
            border-radius: 6px;
            margin: -25px -25px 25px -25px;
          }
          .name { 
            font-size: 2.2em; 
            font-weight: 700; 
            margin-bottom: 8px;
            text-shadow: 0 1px 3px rgba(0,0,0,0.2);
            word-wrap: break-word;
            line-height: 1.2;
          }
          .contact-info { 
            font-size: 1.0em;
            opacity: 0.95;
            margin-bottom: 6px;
            word-wrap: break-word;
            line-height: 1.3;
          }
          .linkedin-link {
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            border-bottom: 1px solid rgba(255,255,255,0.5);
            transition: all 0.3s ease;
            word-wrap: break-word;
            font-size: 0.9em;
          }
          .linkedin-link:hover {
            color: white;
            border-bottom-color: white;
          }
          .section { 
            margin-bottom: 20px; 
            width: 100%;
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 1.2em; 
            font-weight: 600; 
            color: ${primaryColor}; 
            border-bottom: 2px solid ${primaryColor}; 
            margin-bottom: 12px; 
            padding-bottom: 4px;
            display: flex;
            align-items: center;
            width: 100%;
          }
          .section-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            fill: ${primaryColor};
            flex-shrink: 0;
          }
          .skill-tag { 
            background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD);
            color: white; 
            padding: 4px 10px; 
            border-radius: 12px; 
            font-size: 0.8em; 
            margin-right: 8px; 
            display: inline-block; 
            margin-bottom: 6px;
            font-weight: 500;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .job-entry { 
            margin-bottom: 18px; 
            padding: 12px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 3px solid ${primaryColor};
            width: 100%;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          .job-title { 
            font-weight: 600; 
            color: ${primaryColor}; 
            font-size: 1.1em;
            margin-bottom: 4px;
            line-height: 1.3;
          }
          .company { 
            color: #666; 
            margin-bottom: 8px;
            font-weight: 500;
            font-size: 0.95em;
            line-height: 1.3;
          }
          .education-entry { 
            margin-bottom: 15px; 
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 3px solid ${primaryColor};
            width: 100%;
            box-sizing: border-box;
          }
          .degree { 
            font-weight: 600; 
            color: ${primaryColor}; 
            font-size: 1.05em;
            margin-bottom: 4px;
            line-height: 1.3;
          }
          .responsibilities { 
            white-space: pre-line; 
            margin-top: 6px;
            line-height: 1.4;
            word-wrap: break-word;
            font-size: 0.9em;
          }
          .summary-text {
            font-size: 1.0em;
            line-height: 1.5;
            color: #444;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 3px solid ${primaryColor};
            width: 100%;
            box-sizing: border-box;
          }
          .certification-list {
            list-style: none;
            padding: 0;
            width: 100%;
          }
          .certification-list li {
            background: #f8f9fa;
            margin-bottom: 6px;
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 2px solid ${primaryColor};
            font-size: 0.9em;
          }
          .references-text {
            font-style: italic;
            color: #666;
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            font-size: 0.9em;
          }
          
          /* Print styles for A4 paper */
          @media print {
            body {
              font-size: 12px;
              padding: 0;
              background: white;
            }
            .resume-container {
              box-shadow: none;
              border-radius: 0;
              max-width: none;
              min-height: none;
              padding: 20px;
              margin: 0;
            }
            .header {
              margin: -20px -20px 20px -20px;
              padding: 15px;
            }
            .name {
              font-size: 1.8em;
            }
            .section {
              margin-bottom: 15px;
            }
            .job-entry, .education-entry {
              margin-bottom: 12px;
              padding: 10px;
            }
            .section-title {
              font-size: 1.1em;
              margin-bottom: 10px;
            }
            .skill-tag {
              font-size: 0.75em;
              padding: 3px 8px;
              margin-bottom: 4px;
            }
            .summary-text {
              padding: 12px;
            }
          }
          
          /* Mobile responsiveness */
          @media (max-width: 768px) {
            body {
              padding: 10px;
            }
            .resume-container {
              padding: 15px;
              margin: 5px;
            }
            .header {
              margin: -15px -15px 20px -15px;
              padding: 15px;
            }
            .name {
              font-size: 1.8em;
            }
            .section-title {
              font-size: 1.1em;
            }
          }
          
          /* Ensure content fits on one page when possible */
          @page {
            size: A4;
            margin: 0.5in;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <div class="name">${resume.name || 'Your Name'}</div>
            <div class="contact-info">${resume.email || ''} | ${resume.contact || ''}</div>
            ${resume.linkedin ? `<div style="margin-top: 8px;"><a href="${resume.linkedin}" class="linkedin-link">${resume.linkedin}</a></div>` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">
              <svg class="section-icon" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Professional Summary
            </div>
            <div class="summary-text">${resume.summary || 'Professional seeking new opportunities with a strong background in delivering high-quality results and contributing to team success.'}</div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <svg class="section-icon" viewBox="0 0 20 20">
                <path d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"/>
              </svg>
              Work Experience
            </div>
            ${resume.workExperience && resume.workExperience.length > 0 ? resume.workExperience.map(exp => `
              <div class="job-entry">
                <div class="job-title">${exp.title || 'Position Title'}</div>
                <div class="company">${exp.company || 'Company Name'} | ${exp.duration || 'Duration'}</div>
                <div class="responsibilities">${exp.responsibilities || 'Key responsibilities and achievements will be listed here.'}</div>
              </div>
            `).join('') : '<p>No work experience provided.</p>'}
          </div>
          
          <div class="section">
            <div class="section-title">
              <svg class="section-icon" viewBox="0 0 20 20">
                <path d="M9.049 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              Skills
            </div>
            <div>
              ${resume.skills && resume.skills.length > 0 ? resume.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('') : '<p>No skills provided.</p>'}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <svg class="section-icon" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              Education
            </div>
            ${resume.education && resume.education.length > 0 ? resume.education.map(edu => `
              <div class="education-entry">
                <div class="degree">${edu.degree || 'Degree'}</div>
                <div>${edu.university || 'University'} | ${edu.year || 'Year'}</div>
              </div>
            `).join('') : '<p>No education provided.</p>'}
          </div>
          
          ${resume.certifications && resume.certifications.length > 0 ? `
          <div class="section">
            <div class="section-title">
              <svg class="section-icon" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Certifications
            </div>
            <ul class="certification-list">
              ${resume.certifications.map(cert => `<li>${cert}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          ${resume.references && resume.references !== 'Available upon request' ? `
          <div class="section">
            <div class="section-title">
              <svg class="section-icon" viewBox="0 0 20 20">
                <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"/>
              </svg>
              References
            </div>
            <div class="references-text">${resume.references}</div>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  // State to store ATS score and AI suggestions
  const [atsScore, setAtsScore] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({
    summary: [],
    experience: [],
    skills: [],
    education: [],
    overall: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Function to analyze resume content and generate specific suggestions
  const generateSpecificSuggestions = (resume) => {
    return generatePersonalizedSuggestions(resume);
  };

  useEffect(() => {
    const analyzeResume = async () => {
      if (resumeData && Object.keys(resumeData).length > 0) {
        setIsAnalyzing(true);
        try {
          // Calculate ATS score using the enhanced scoring function
          const scoreResult = calculateATSScore(resumeData);
          
          // Handle both old number format and new object format
          if (typeof scoreResult === 'object' && scoreResult.score !== undefined) {
            setAtsScore(scoreResult.score);
          } else if (typeof scoreResult === 'number') {
            setAtsScore(scoreResult);
          } else {
            setAtsScore(0);
          }

          // Generate specific suggestions based on resume content
          const suggestions = generatePersonalizedSuggestions(resumeData);
          setAiSuggestions(suggestions || {
            summary: [],
            experience: [],
            skills: [],
            education: [],
            overall: []
          });
        } catch (err) {
          console.error('❌ Resume analysis failed', err);
          setAtsScore(0);
          setAiSuggestions({
            summary: [],
            experience: [],
            skills: [],
            education: [],
            overall: []
          });
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeResume();
  }, [resumeData]);

  // Function to handle downloads
  const handleDownload = async (type) => {
    try {
      if (type === 'pdf') {
        // Use the already loaded template HTML
        if (!templateHtml) {
          alert('Template is still loading. Please wait...');
          return;
        }
        
        // Add print-specific styles
        const style = document.createElement('style');
        style.innerHTML = `
          @media print {
            body * {
              visibility: hidden;
            }
            #resume-content, #resume-content * {
              visibility: visible;
            }
            #resume-content iframe {
              width: 100% !important;
              height: 100vh !important;
            }
            #resume-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print, .floating-help-icon {
              display: none !important;
            }
            @page {
              margin: 0;
              size: A4;
            }
            body {
              font-family: Arial, sans-serif;
            }
            /* Ensure colors print correctly */
            #resume-content .bg-[#1A237E] {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: #1A237E !important;
              color: white !important;
            }
            #resume-content .text-[#1A237E] {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color: #1A237E !important;
            }
            #resume-content .border-[#1A237E] {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              border-color: #1A237E !important;
            }
          }
        `;
        
        // For iframe content, we need to access the iframe document
        const iframe = document.querySelector('#resume-content iframe');
        if (iframe && useDatabase) {
          // Print the iframe content
          document.head.appendChild(style);
          
          // Focus the iframe and print
          iframe.focus();
          iframe.contentWindow.print();
          
          // Cleanup
          document.head.removeChild(style);
        } else {
          // For fallback template, create a temporary container
          const container = document.createElement('div');
          container.innerHTML = templateHtml || createFallbackHtml(resumeData, selectedColor);
          container.id = 'resume-content';
          document.body.appendChild(container);
          document.head.appendChild(style);
          
          // Print
          window.print();
          
          // Cleanup
          document.body.removeChild(container);
          document.head.removeChild(style);
        }

        // Show feedback popup after PDF download
        setTimeout(() => {
          if (!feedbackSubmitted) {
            setShowFeedbackPopup(true);
          }
        }, 1000);

      } else if (type === 'word') {
        console.log('📄 Converting displayed template to Word format...');
        
        // Get the actual displayed HTML content (same as PDF)
        let actualTemplateHtml = '';
        
        if (useDatabase && templateHtml) {
          actualTemplateHtml = templateHtml;
          console.log('📄 Using database template HTML for Word');
        } else {
          actualTemplateHtml = createFallbackHtml(resumeData, selectedColor);
          console.log('📄 Using fallback template HTML for Word');
        }

        // Parse the actual template HTML to extract content and styling
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(actualTemplateHtml, 'text/html');
        
        const primaryColorHex = selectedColor.replace('#', '');
        const sections = [];

        console.log('📄 Parsing template HTML structure...');

        // Detect if this is a two-column layout (Creative template)
        const container = htmlDoc.querySelector('.container');
        const sidebar = htmlDoc.querySelector('.sidebar');
        const mainContent = htmlDoc.querySelector('.main-content');
        const isTwoColumnLayout = container && sidebar && mainContent;

        console.log('📄 Two-column layout detected:', isTwoColumnLayout);

        if (isTwoColumnLayout) {
          // Handle two-column Creative template layout
          console.log('📄 Creating two-column Word layout...');
          
          // Create a table for two-column layout
          const { Table, TableRow, TableCell, WidthType } = await import('docx');
          
          // Extract sidebar content with correct selectors
          const profileSection = sidebar.querySelector('.profile-section');
          const sidebarName = profileSection?.querySelector('.name')?.textContent?.trim() || resumeData.name;
          const sidebarTitle = profileSection?.querySelector('.title')?.textContent?.trim() || 'Creative Professional';
          const contactItems = sidebar.querySelectorAll('.contact-item');
          const skillItems = sidebar.querySelectorAll('.skill-item');
          const sidebarSections = sidebar.querySelectorAll('.sidebar-section');
          
          // Extract main content sections
          const mainSections = mainContent.querySelectorAll('.section');
          
          console.log('📄 Found sidebar elements:', {
            name: !!sidebarName,
            title: !!sidebarTitle,
            contactItems: contactItems.length,
            skillItems: skillItems.length,
            sidebarSections: sidebarSections.length,
            mainSections: mainSections.length
          });
          
          // Create sidebar cell content
          const sidebarCells = [];
          
          // Sidebar header with name
          sidebarCells.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sidebarName,
                  size: 36,
                  bold: true,
                  color: "FFFFFF"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            })
          );

          // Sidebar subtitle
          if (sidebarTitle && sidebarTitle !== sidebarName) {
            sidebarCells.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: sidebarTitle,
                    size: 20,
                    color: "FFFFFF",
                    italics: true
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 }
              })
            );
          }

          // Process sidebar sections (Contact, Skills, etc.)
          sidebarSections.forEach(section => {
            const sectionTitle = section.querySelector('.sidebar-title')?.textContent?.trim();
            
            if (sectionTitle) {
              sidebarCells.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sectionTitle.toUpperCase(),
                      size: 18,
                      bold: true,
                      color: "FFFFFF"
                    })
                  ],
                  spacing: { before: 200, after: 150 }
                })
              );

              // Handle contact items
              if (sectionTitle.toLowerCase().includes('contact')) {
                const sectionContactItems = section.querySelectorAll('.contact-item');
                sectionContactItems.forEach(item => {
                  const contactText = item.textContent.trim();
                  if (contactText) {
                    sidebarCells.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: contactText,
                            size: 14,
                            color: "FFFFFF"
                          })
                        ],
                        spacing: { after: 100 }
                      })
                    );
                  }
                });
              }

              // Handle skills
              if (sectionTitle.toLowerCase().includes('skill')) {
                const sectionSkillItems = section.querySelectorAll('.skill-item');
                sectionSkillItems.forEach(skill => {
                  const skillText = skill.textContent.trim();
                  if (skillText) {
                    sidebarCells.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: skillText,
                            size: 14,
                            color: "FFFFFF"
                          })
                        ],
                        spacing: { after: 80 }
                      })
                    );
                  }
                });
              }

              // Handle certifications
              if (sectionTitle.toLowerCase().includes('certification')) {
                const certItems = section.querySelectorAll('div, p, li');
                certItems.forEach(cert => {
                  const certText = cert.textContent.trim();
                  if (certText && !certText.toLowerCase().includes('certification')) {
                    sidebarCells.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: certText,
                            size: 14,
                            color: "FFFFFF"
                          })
                        ],
                        spacing: { after: 80 }
                      })
                    );
                  }
                });
              }
            }
          });

          // Create main content cells
          const mainContentCells = [];

          mainSections.forEach(section => {
            const titleElement = section.querySelector('.section-title');
            const sectionTitle = titleElement?.textContent?.trim();

            if (sectionTitle) {
              mainContentCells.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sectionTitle,
                      size: 26,
                      bold: true,
                      color: primaryColorHex
                    })
                  ],
                  spacing: { before: 300, after: 200 },
                  border: {
                    bottom: {
                      color: primaryColorHex,
                      style: BorderStyle.SINGLE,
                      size: 3
                    }
                  }
                })
              );
            }

            // Handle About Me section
            if (sectionTitle?.toLowerCase().includes('about')) {
              const aboutText = section.querySelector('p')?.textContent?.trim();
              if (aboutText) {
                mainContentCells.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: aboutText,
                        size: 18,
                        color: "444444"
                      })
                    ],
                    spacing: { after: 200 }
                  })
                );
              }
            }

            // Handle Experience section
            if (sectionTitle?.toLowerCase().includes('experience')) {
              const experienceItems = section.querySelectorAll('.experience-item');
              experienceItems.forEach(item => {
                const jobTitle = item.querySelector('.job-title')?.textContent?.trim();
                const companyInfo = item.querySelector('.company-info')?.textContent?.trim();
                const jobDescription = item.querySelector('.job-description')?.textContent?.trim();

                if (jobTitle) {
                  mainContentCells.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: jobTitle,
                          size: 22,
                          bold: true,
                          color: primaryColorHex
                        })
                      ],
                      spacing: { before: 200, after: 100 }
                    })
                  );
                }

                if (companyInfo) {
                  mainContentCells.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: companyInfo,
                          size: 16,
                          color: "666666",
                          italics: true
                        })
                      ],
                      spacing: { after: 100 }
                    })
                  );
                }

                if (jobDescription) {
                  // Split job description into bullet points if it contains line breaks
                  const descriptionLines = jobDescription.split('\n').filter(line => line.trim());
                  if (descriptionLines.length > 1) {
                    descriptionLines.forEach(line => {
                      mainContentCells.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `• ${line.trim()}`,
                              size: 16,
                              color: "555555"
                            })
                          ],
                          indent: { left: 200 },
                          spacing: { after: 80 }
                        })
                      );
                    });
                  } else {
                    mainContentCells.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: jobDescription,
                            size: 16,
                            color: "555555"
                          })
                        ],
                        spacing: { after: 150 }
                      })
                    );
                  }
                }
              });
            }

            // Handle Education section
            if (sectionTitle?.toLowerCase().includes('education')) {
              const educationItems = section.querySelectorAll('.education-item');
              educationItems.forEach(item => {
                const degree = item.querySelector('.degree')?.textContent?.trim();
                const school = item.querySelector('.school')?.textContent?.trim();

                if (degree) {
                  mainContentCells.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: degree,
                          size: 20,
                          bold: true,
                          color: primaryColorHex
                        })
                      ],
                      spacing: { before: 150 }
                    })
                  );
                }

                if (school) {
                  mainContentCells.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: school,
                          size: 16,
                          color: "666666",
                          italics: true
                        })
                      ],
                      spacing: { after: 150 }
                    })
                  );
                }
              });
            }
          });

          // Create two-column table
          const table = new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: sidebarCells,
                    width: {
                      size: 35,
                      type: WidthType.PERCENTAGE
                    },
                    shading: {
                      fill: primaryColorHex,
                      color: primaryColorHex,
                      val: "clear"
                    },
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 200,
                      right: 200
                    }
                  }),
                  new TableCell({
                    children: mainContentCells,
                    width: {
                      size: 65,
                      type: WidthType.PERCENTAGE
                    },
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 300,
                      right: 200
                    }
                  })
                ]
              })
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            }
          });

          sections.push(table);

        } else {
          // Handle single-column layout (existing code)
          const nameElement = htmlDoc.querySelector('.name, h1, .header h1, .resume-header h1');
          const contactElements = htmlDoc.querySelectorAll('.contact-info, .contact, .header .contact-info');
          const linkedinElement = htmlDoc.querySelector('.linkedin-link, a[href*="linkedin"], .linkedin');

          // Create header section matching the actual template
          if (nameElement) {
            const nameText = nameElement.textContent.trim();
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: nameText,
                    size: 44,
                    bold: true,
                    color: "FFFFFF"
                  })
                ],
                alignment: AlignmentType.CENTER,
                shading: {
                  fill: primaryColorHex,
                  color: primaryColorHex,
                  val: "clear"
                },
                spacing: { before: 200, after: 150 }
              })
            );
          }

          // Extract and add contact information
          contactElements.forEach(contactEl => {
            if (contactEl && contactEl.textContent.trim()) {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: contactEl.textContent.trim(),
                      size: 20,
                      color: "FFFFFF"
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  shading: {
                    fill: primaryColorHex,
                    color: primaryColorHex,
                    val: "clear"
                  },
                  spacing: { after: 100 }
                })
              );
            }
          });

          // Add LinkedIn if present
          if (linkedinElement && linkedinElement.textContent.trim()) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: linkedinElement.textContent.trim(),
                    size: 18,
                    color: "FFFFFF",
                    underline: {}
                  })
                ],
                alignment: AlignmentType.CENTER,
                shading: {
                  fill: primaryColorHex,
                  color: primaryColorHex,
                  val: "clear"
                },
                spacing: { after: 400 }
              })
            );
          }

          // Extract all sections from the template
          const sectionElements = htmlDoc.querySelectorAll('.section, section, .resume-section');
          console.log('📄 Found', sectionElements.length, 'sections in template');

          sectionElements.forEach((section, index) => {
            // Extract section title
            const titleElement = section.querySelector('.section-title, h2, h3, .title, .section-header');
            let sectionTitle = '';
            
            if (titleElement) {
              sectionTitle = titleElement.textContent.trim().replace(/[^\w\s]/gi, '').trim();
              
              // Add section title
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sectionTitle,
                      size: 26,
                      bold: true,
                      color: primaryColorHex
                    })
                  ],
                  spacing: { before: 400, after: 200 },
                  border: {
                    bottom: {
                      color: primaryColorHex,
                      style: BorderStyle.SINGLE,
                      size: 2
                    }
                  }
                })
              );
            }

            // Extract section content based on the actual HTML structure
            const contentElements = section.querySelectorAll('p, div, li, .summary-text, .job-entry, .education-entry, .skill-tag, .certification-list li');
            
            contentElements.forEach(element => {
              const text = element.textContent.trim();
              if (text && text.length > 0) {
                
                // Determine styling based on element class and content
                let fontSize = 18;
                let isBold = false;
                let color = "333333";
                let backgroundColor = null;
                let indent = 0;
                let hasBorder = false;

                // Check element classes and adjust styling
                if (element.classList.contains('job-title') || element.classList.contains('degree')) {
                  fontSize = 22;
                  isBold = true;
                  color = primaryColorHex;
                  backgroundColor = "F8F9FA";
                  indent = 200;
                  hasBorder = true;
                } else if (element.classList.contains('company') || element.classList.contains('university')) {
                  fontSize = 18;
                  color = "666666";
                  backgroundColor = "F8F9FA";
                  indent = 200;
                  hasBorder = true;
                } else if (element.classList.contains('summary-text')) {
                  fontSize = 20;
                  color = "444444";
                  backgroundColor = "F8F9FA";
                  indent = 300;
                } else if (element.classList.contains('skill-tag')) {
                  fontSize = 16;
                  color = "FFFFFF";
                  // Skills will be handled separately
                  return;
                } else if (element.classList.contains('responsibilities') || element.textContent.includes('•')) {
                  fontSize = 18;
                  color = "333333";
                  backgroundColor = "F8F9FA";
                  indent = 400;
                  hasBorder = true;
                }

                // Create paragraph with appropriate styling
                const paragraphOptions = {
                  children: [
                    new TextRun({
                      text: text.startsWith('•') ? text : (element.classList.contains('responsibilities') ? `• ${text}` : text),
                      size: fontSize,
                      bold: isBold,
                      color: color
                    })
                  ],
                  spacing: { after: 100 }
                };

                if (backgroundColor) {
                  paragraphOptions.shading = {
                    fill: backgroundColor,
                    color: backgroundColor,
                    val: "clear"
                  };
                }

                if (indent > 0) {
                  paragraphOptions.indent = { left: indent };
                }

                if (hasBorder) {
                  paragraphOptions.border = {
                    left: {
                      color: primaryColorHex,
                      style: BorderStyle.SINGLE,
                      size: 6
                    }
                  };
                }

                sections.push(new Paragraph(paragraphOptions));
              }
            });

            // Handle skills specially (extract skill tags and combine)
            const skillTags = section.querySelectorAll('.skill-tag');
            if (skillTags.length > 0) {
              const skillsText = Array.from(skillTags).map(tag => tag.textContent.trim()).join(' • ');
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: skillsText,
                      size: 18,
                      color: "333333"
                    })
                  ],
                  spacing: { after: 300 }
                })
              );
            }
          });
        }

        console.log('📄 Generated', sections.length, 'Word sections from template');

        // Create Word document
        const doc = new Document({
          properties: {
            title: `${resumeData.name} - Resume`,
            description: `Resume using ${useDatabase ? 'database' : 'fallback'} template`
          },
          sections: [{
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440
                }
              }
            },
            children: sections
          }]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.name.replace(/\s+/g, '_')}_resume.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('✅ Word document generated from actual template');

        // Show feedback popup after Word download
        setTimeout(() => {
          if (!feedbackSubmitted) {
            setShowFeedbackPopup(true);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Still show feedback popup even if download fails
      setTimeout(() => {
        if (!feedbackSubmitted) {
          setShowFeedbackPopup(true);
        }
      }, 1000);
    }
  };

  const handleFeedbackSuccess = () => {
    setFeedbackSubmitted(true);
    setShowFeedbackPopup(false);
    
    // Show a success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed bottom-4 right-4 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = '✅ Thank you for your feedback!';
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackPopup(false);
  };

  const renderSuggestionSection = (title, suggestions, icon) => {
    // Ensure suggestions is an array before trying to map over it
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return null; // Don't render empty sections
    }
    
    return (
      <div className="mb-6">
        <div className="flex items-center mb-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 ml-2">{title}</h3>
        </div>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-2 text-gray-700">
              <span className="text-green-500 mt-1">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!resumeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with title and actions */}
      <div className="bg-black text-white py-4 px-8 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold">Resume Preview</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/editor', { state: resumeData })}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Edit Resume
            </button>
            <button
              onClick={() => navigate('/templates', { state: resumeData })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
              Change Template
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrintDialog(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </span>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="py-8">
        <div className="w-full">
          {/* Resume Preview Section */}
          <div className="bg-transparent shadow-none rounded-none overflow-visible mb-8">
            {/* Resume Content using selected Template */}
            <div id="resume-content" className="w-full">
              {loadingTemplate ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A237E]"></div>
                  <span className="ml-3 text-gray-600">Loading template...</span>
                </div>
              ) : templateHtml && templateHtml.trim() && useDatabase ? (
                <>
                  <div style={{ display: 'none' }}>
                    {console.log('🎯 Rendering database template in iframe, length:', templateHtml.length)}
                  </div>
                  {/* Use iframe to isolate database template styles */}
                  <iframe
                    srcDoc={templateHtml}
                    style={{
                      width: '100%',
                      height: '1200px',
                      border: 'none',
                      backgroundColor: 'white'
                    }}
                    title="Resume Template"
                  />
                </>
              ) : (
                <>
                  <div style={{ display: 'none' }}>
                    {console.log('🎯 Rendering fallback template, length:', templateHtml?.length || 0)}
                  </div>
                  <div dangerouslySetInnerHTML={{ 
                    __html: createFallbackHtml(resumeData, selectedColor) 
                  }} />
                </>
              )}
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden no-print max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 border-b border-gray-200 bg-black text-white">
                              <h2 className="text-xl font-bold">ResumePro Analysis</h2>
            </div>
            
            <div className="p-6">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  <span className="ml-3">Analyzing your resume...</span>
                </div>
              ) : (
                <>
                  {/* ATS Score */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ATS Compatibility Score</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-green-500 rounded-full h-4 transition-all duration-300"
                          style={{ width: `${atsScore || 0}%` }}
                        />
                      </div>
                      <span className="text-xl font-medium text-green-600">
                        {atsScore !== null && atsScore !== undefined ? `${atsScore}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Suggestions */}
                  <div className="space-y-6">
                    {aiSuggestions.summary && aiSuggestions.summary.length > 0 && renderSuggestionSection("Professional Summary Improvements", aiSuggestions.summary, 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}

                    {aiSuggestions.experience && aiSuggestions.experience.length > 0 && renderSuggestionSection("Work Experience Enhancements", aiSuggestions.experience,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}

                    {aiSuggestions.skills && aiSuggestions.skills.length > 0 && renderSuggestionSection("Skills Recommendations", aiSuggestions.skills,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                      </svg>
                    )}

                    {aiSuggestions.education && aiSuggestions.education.length > 0 && renderSuggestionSection("Education Improvements", aiSuggestions.education,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    )}

                    {aiSuggestions.overall && aiSuggestions.overall.length > 0 && renderSuggestionSection("Overall Recommendations", aiSuggestions.overall,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}

                    {/* Show message if no suggestions */}
                    {(!aiSuggestions.summary || aiSuggestions.summary.length === 0) &&
                     (!aiSuggestions.experience || aiSuggestions.experience.length === 0) &&
                     (!aiSuggestions.skills || aiSuggestions.skills.length === 0) &&
                     (!aiSuggestions.education || aiSuggestions.education.length === 0) &&
                     (!aiSuggestions.overall || aiSuggestions.overall.length === 0) && (
                      <div className="text-center py-8">
                        <div className="text-green-600 text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellent Resume!</h3>
                        <p className="text-gray-600">Your resume looks comprehensive. Consider tailoring it for specific job applications.</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    {/* Apply AI Improvements Button */}
                    <button
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={() => navigate('/editor', { state: resumeData })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>✨ Apply AI Improvements</span>
                    </button>

                    {/* Other Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate('/templates', { state: resumeData })}
                        className="flex items-center justify-center space-x-2 bg-[#1A237E] text-white px-4 py-3 rounded-lg hover:bg-[#1A237E]/90 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                        </svg>
                        <span>Change Template</span>
                      </button>

                      <button
                        onClick={() => navigate('/cover-letter', { state: resumeData })}
                        className="flex items-center justify-center space-x-2 bg-[#3F51B5] text-white px-4 py-3 rounded-lg hover:bg-[#3F51B5]/90 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span>Cover Letter</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Popup */}
      <FeedbackPopup
        isOpen={showFeedbackPopup}
        onClose={handleFeedbackClose}
        onSuccess={handleFeedbackSuccess}
      />

      {/* Custom Print Dialog */}
      {showPrintDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Download Resume</h3>
                <button
                  onClick={() => setShowPrintDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">Choose your preferred download format:</p>
              
              <div className="space-y-3">
                {/* PDF Option */}
                <button
                  onClick={() => {
                    setShowPrintDialog(false);
                    handleDownload('pdf');
                  }}
                  className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Save as PDF</h4>
                    <p className="text-sm text-gray-500">Perfect for printing and sharing</p>
                  </div>
                </button>

                {/* Word Option */}
                <button
                  onClick={() => {
                    setShowPrintDialog(false);
                    handleDownload('word');
                  }}
                  className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Save as Word</h4>
                    <p className="text-sm text-gray-500">Editable document format</p>
                  </div>
                </button>

                {/* Print Option */}
                <button
                  onClick={() => {
                    setShowPrintDialog(false);
                    // Trigger browser print dialog
                    setTimeout(() => {
                      handleDownload('pdf'); // This triggers the print functionality
                    }, 100);
                  }}
                  className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Print Resume</h4>
                    <p className="text-sm text-gray-500">Print directly or save as PDF from browser</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;


