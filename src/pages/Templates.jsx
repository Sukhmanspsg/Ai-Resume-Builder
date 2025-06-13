// src/pages/Templates.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResumeTemplate.css';

const Templates = () => {
  const { state: resumeData } = useLocation();
  const navigate = useNavigate();
  const [selectedColors, setSelectedColors] = useState({});
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoTemplate, setSelectedPhotoTemplate] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Default color palette for all templates
  const defaultColors = [
    { bg: 'bg-gray-100', color: '#1A237E' },
    { bg: 'bg-[#1A237E]', color: '#1A237E' },
    { bg: 'bg-blue-700', color: '#1d4ed8' },
    { bg: 'bg-blue-400', color: '#60a5fa' },
    { bg: 'bg-teal-400', color: '#2dd4bf' },
    { bg: 'bg-pink-200', color: '#ec4899' },
    { bg: 'bg-green-200', color: '#22c55e' },
    { bg: 'bg-yellow-200', color: '#eab308' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/templates');
      const dbTemplates = response.data.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        html_code: template.html_code,
        category: template.category || 'General',
        colors: defaultColors
      }));
      
      setTemplates(dbTemplates);
      
      // Debug: Log all templates
      console.log('🎨 Loaded templates:', dbTemplates.map(t => ({ id: t.id, name: t.name })));
      
      // Initialize selected colors for each template
      const initialColors = {};
      dbTemplates.forEach(template => {
        initialColors[template.id] = '#1A237E';
      });
      setSelectedColors(initialColors);
      
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fallback to empty array if fetch fails
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (templateId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [templateId]: color
    }));
  };

  const handleTemplateSelect = (templateId) => {
    console.log('🎯 Template selected:', templateId);
    
    // Find the template by ID to check its name
    const selectedTemplateData = templates.find(t => t.id === templateId);
    console.log('📋 Selected template data:', selectedTemplateData);
    
    // Only ask for photo upload if it's explicitly a "with photo" template
    if (selectedTemplateData && selectedTemplateData.name.toLowerCase().includes('with photo')) {
      console.log('📷 Photo template selected - showing photo modal');
      // Photo template selected directly, show photo modal
      setSelectedPhotoTemplate(templateId);
      setShowPhotoModal(true);
    } else {
      console.log('📄 Template selected - using directly');
      // For all other templates (original, no-photo, etc.), go directly to preview
      navigate('/resume-preview', { 
        state: { 
          ...resumeData,
          selectedTemplate: templateId,
          selectedColor: selectedColors[templateId],
          useDatabase: true
        } 
      });
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF).');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB.');
      return;
    }

    setPhotoUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedPhoto(e.target.result);
      setPhotoUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Proceed with photo template selection
  const proceedWithPhotoTemplate = () => {
    setShowPhotoModal(false);
    
    // Find the selected template to get its base name
    const selectedTemplateData = templates.find(t => t.id === selectedPhotoTemplate);
    
    let photoTemplateId = selectedPhotoTemplate;
    
    // If it's already a "with photo" template, use it directly
    if (selectedTemplateData && selectedTemplateData.name.toLowerCase().includes('with photo')) {
      photoTemplateId = selectedPhotoTemplate;
      console.log('📸 Using already selected photo template:', selectedTemplateData.name, '→ ID:', photoTemplateId);
    } else {
      // Find the "with photo" version of the base template
      const baseName = selectedTemplateData ? selectedTemplateData.name : 'Professional';
      const photoTemplate = templates.find(t => 
        t.name.toLowerCase().includes(baseName.toLowerCase()) && 
        t.name.toLowerCase().includes('with photo')
      );
      photoTemplateId = photoTemplate ? photoTemplate.id : 103; // Fallback to Professional with Photo
      console.log('📸 Found photo template for:', baseName, '→ ID:', photoTemplateId);
    }
    
    navigate('/resume-preview', { 
      state: { 
        ...resumeData,
        photo: uploadedPhoto, // Include the uploaded photo
        selectedTemplate: photoTemplateId,
        selectedColor: selectedColors[selectedPhotoTemplate],
        useDatabase: true
      } 
    });
  };

  // Proceed without photo
  const proceedWithoutPhoto = () => {
    setShowPhotoModal(false);
    
    // Find the selected template to get its base name
    const selectedTemplateData = templates.find(t => t.id === selectedPhotoTemplate);
    
    // Get the base name (remove "with photo" if present)
    let baseName = selectedTemplateData ? selectedTemplateData.name : 'Professional';
    if (baseName.toLowerCase().includes('with photo')) {
      baseName = baseName.replace(/\s*\(with photo\)/i, '').trim();
    }
    
    // Find the "no photo" version
    const noPhotoTemplate = templates.find(t => 
      t.name.toLowerCase().includes(baseName.toLowerCase()) && 
      t.name.toLowerCase().includes('no photo')
    );
    const noPhotoTemplateId = noPhotoTemplate ? noPhotoTemplate.id : 96; // Fallback to Professional No Photo
    
    console.log('📄 Using no-photo template for:', baseName, '→ ID:', noPhotoTemplateId);
    
    navigate('/resume-preview', { 
      state: { 
        ...resumeData,
        selectedTemplate: noPhotoTemplateId,
        selectedColor: selectedColors[selectedPhotoTemplate],
        useDatabase: true
      } 
    });
  };

  // Close photo modal
  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotoTemplate(null);
    setUploadedPhoto(null);
  };

  // Create a preview component for database templates
  const DatabaseTemplatePreview = ({ template, primaryColor, resume }) => {
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
      // Create a preview version of the template with sample data
      const sampleData = {
        name: resume?.name || 'John Doe',
        email: resume?.email || 'john.doe@email.com',
        contact: resume?.contact || '+1 (555) 123-4567',
        linkedin: resume?.linkedin || 'linkedin.com/in/johndoe',
        summary: resume?.summary || 'Experienced professional with strong background in technology and leadership.',
        photo: '', // Always start with no photo to show placeholder in preview
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Company Inc.',
            startDate: '2022',
            endDate: 'Present',
            responsibilities: 'Led development of multiple high-impact projects and mentored junior developers.'
          },
          {
            title: 'Software Engineer',
            company: 'Innovation Labs',
            startDate: '2020',
            endDate: '2022',
            responsibilities: 'Developed scalable web applications using modern technologies.'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            university: 'University of Technology',
            year: '2020'
          }
        ],
        certifications: ['AWS Certified Developer', 'Google Analytics Certified']
      };

      // Enhanced template rendering with better handling
      let html = template.html_code
        .replace(/\{\{primaryColor\}\}/g, primaryColor)
        .replace(/\{\{name\}\}/g, sampleData.name)
        .replace(/\{\{email\}\}/g, sampleData.email)
        .replace(/\{\{contact\}\}/g, sampleData.contact)
        .replace(/\{\{linkedin\}\}/g, sampleData.linkedin)
        .replace(/\{\{summary\}\}/g, sampleData.summary);

      // Handle skills with different template styles
      let skillsHtml = '';
      if (html.includes('skill-tag')) {
        skillsHtml = sampleData.skills.map(skill => 
          `<span class="skill-tag">${skill}</span>`
        ).join('');
      } else if (html.includes('tech-item')) {
        skillsHtml = sampleData.skills.map(skill => 
          `<div class="tech-item">${skill}</div>`
        ).join('');
      } else if (html.includes('skill-item')) {
        skillsHtml = sampleData.skills.map(skill => 
          `<div class="skill-item">${skill}</div>`
        ).join('');
      } else if (html.includes('competency')) {
        skillsHtml = sampleData.skills.map(skill => 
          `<div class="competency">${skill}</div>`
        ).join('');
      } else {
        skillsHtml = sampleData.skills.map(skill => `<li>${skill}</li>`).join('');
      }
      html = html.replace(/\{\{skills\}\}/g, skillsHtml);

      // Handle experience with different template styles
      let experienceHtml = '';
      if (html.includes('experience-item')) {
        experienceHtml = sampleData.experience.map(exp => `
          <div class="experience-item">
            <div class="job-title">${exp.title}</div>
            <div class="company-info">${exp.company} | ${exp.startDate} - ${exp.endDate}</div>
            <div class="job-description">${exp.responsibilities}</div>
          </div>
        `).join('');
      } else if (html.includes('experience-block')) {
        experienceHtml = sampleData.experience.map(exp => `
          <div class="experience-block">
            <div class="job-function">${exp.title}</div>
            <div class="company-tenure">${exp.company} | ${exp.startDate} - ${exp.endDate}</div>
            <div class="responsibilities">${exp.responsibilities}</div>
          </div>
        `).join('');
      } else if (html.includes('achievement-item')) {
        experienceHtml = sampleData.experience.map(exp => `
          <div class="achievement-item">
            <div class="role-title">${exp.title}</div>
            <div class="company-info">
              <span>${exp.company}</span>
              <span class="tenure">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <div class="achievements">${exp.responsibilities}</div>
          </div>
        `).join('');
      } else if (html.includes('position-entry')) {
        experienceHtml = sampleData.experience.map(exp => `
          <div class="position-entry">
            <div class="position-title">${exp.title}</div>
            <div class="institution">${exp.company}</div>
            <div class="date-range">${exp.startDate} - ${exp.endDate}</div>
            <div class="description">${exp.responsibilities}</div>
          </div>
        `).join('');
      } else {
        experienceHtml = sampleData.experience.map(exp => `
          <div class="job-entry">
            <div class="job-header">
              <div class="job-title">${exp.title}</div>
              <div class="job-dates">${exp.startDate} - ${exp.endDate}</div>
            </div>
            <div class="company">${exp.company}</div>
            <div class="responsibilities">${exp.responsibilities}</div>
          </div>
        `).join('');
      }
      html = html.replace(/\{\{experience\}\}/g, experienceHtml);

      // Handle education
      let educationHtml = '';
      if (html.includes('education-executive')) {
        educationHtml = sampleData.education.map(edu => `
          <div class="education-executive">
            <div class="degree-info">
              <div class="degree-title">${edu.degree}</div>
              <div class="institution">${edu.university}</div>
            </div>
            <div class="year">${edu.year}</div>
          </div>
        `).join('');
      } else if (html.includes('education-item')) {
        educationHtml = sampleData.education.map(edu => `
          <div class="education-item">
            <div class="degree">${edu.degree}</div>
            <div class="school">${edu.university}</div>
            <div class="year">${edu.year}</div>
          </div>
        `).join('');
      } else {
        educationHtml = sampleData.education.map(edu => `
          <div class="education-entry">
            <div class="degree">${edu.degree}</div>
            <div class="university">${edu.university}</div>
            <div class="year">${edu.year}</div>
          </div>
        `).join('');
      }
      html = html.replace(/\{\{education\}\}/g, educationHtml);

      // Handle certifications
      let certificationsHtml = '';
      if (html.includes('award-entry')) {
        certificationsHtml = sampleData.certifications.map(cert => 
          `<div class="award-entry"><span class="award-title">${cert}</span></div>`
        ).join('');
      } else if (html.includes('skill-item')) {
        certificationsHtml = sampleData.certifications.map(cert => 
          `<div class="skill-item">${cert}</div>`
        ).join('');
      } else {
        certificationsHtml = sampleData.certifications.map(cert => `<li>${cert}</li>`).join('');
        certificationsHtml = `<ul>${certificationsHtml}</ul>`;
      }
      html = html.replace(/\{\{certifications\}\}/g, certificationsHtml);

      // Handle conditional sections
      html = html.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
        if (sampleData[condition] && (Array.isArray(sampleData[condition]) ? sampleData[condition].length > 0 : sampleData[condition])) {
          return content;
        }
        return '';
      });

      // Clean up any remaining placeholders
      html = html.replace(/\{\{[^}]+\}\}/g, '');

      setPreviewHtml(html);
    }, [template, primaryColor, resume]);

    return (
      <div 
        className="template-preview-container"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: '8px',
          backgroundColor: 'white',
          position: 'relative'
        }}
      >
        <iframe
          srcDoc={previewHtml}
          style={{
            width: '300%',
            height: '400%',
            border: 'none',
            transform: 'scale(0.33)',
            transformOrigin: '0 0',
            position: 'absolute',
            top: '40px',
            left: '0'
          }}
          title={`Preview of ${template.name}`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A237E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Resume Template</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select from our professionally designed templates stored in the database. 
            Each template is customizable with different color schemes.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {templates.map((template) => (
            <div key={template.id} className="group relative">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                {/* Template Preview Window */}
                <div className="relative h-[500px] overflow-hidden">
                  {/* Color Palette */}
                  <div className="absolute top-4 right-4 flex space-x-2 z-10">
                    {template.colors.map((colorObj, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(template.id, colorObj.color)}
                        className={`w-6 h-6 rounded-full ${colorObj.bg} cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          ${selectedColors[template.id] === colorObj.color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                        `}
                      />
                    ))}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-[#1A237E] text-white rounded-full text-sm font-medium">
                      {template.category}
                    </span>
                  </div>

                  {/* Template Preview */}
                  <div className="w-full h-full p-4">
                    <DatabaseTemplatePreview 
                      template={template}
                      primaryColor={selectedColors[template.id]}
                      resume={resumeData}
                    />
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6 bg-white border-t border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm min-h-[40px]">{template.description}</p>
                  <button
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full bg-[#1A237E] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-[#1A237E]/90 transition-all duration-300 hover:shadow-lg"
                  >
                    {template.name.toLowerCase().includes('with photo') 
                      ? 'Use With Photo' 
                      : template.name.toLowerCase().includes('no photo')
                      ? 'Use Without Photo'
                      : 'Use This Template'
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600">Templates will appear here once they are added to the database.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">📸 Photo Template</h3>
                <p className="text-gray-600">This template supports profile photos. Choose how you'd like to proceed.</p>
              </div>

              {/* Photo Upload Section */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedPhoto ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedPhoto}
                        alt="Uploaded preview"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                      />
                      <p className="text-sm text-green-600 font-medium">✓ Photo uploaded successfully!</p>
                      <button
                        onClick={() => setUploadedPhoto(null)}
                        className="text-sm text-red-600 hover:text-red-700 underline"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <label htmlFor="photo-upload-modal" className="cursor-pointer">
                          <div className="text-[#1A237E] font-medium hover:text-[#1A237E]/80 transition-colors">
                            {photoUploading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              'Click to upload photo'
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">JPEG, PNG, GIF • Max 2MB • Square recommended</p>
                        </label>
                        <input
                          id="photo-upload-modal"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={photoUploading}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={proceedWithPhotoTemplate}
                  disabled={!uploadedPhoto}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    uploadedPhoto
                      ? 'bg-[#1A237E] text-white hover:bg-[#1A237E]/90 hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  📷 Continue with Photo
                </button>
                <button
                  onClick={proceedWithoutPhoto}
                  className="w-full py-3 px-4 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
                >
                  📝 Continue Without Photo
                </button>
                <button
                  onClick={closePhotoModal}
                  className="w-full py-2 px-4 rounded-xl font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
