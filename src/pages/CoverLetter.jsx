// TemplatePreview.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import api from '../services/api';
import FeedbackPopup from '../components/FeedbackPopup';

const CoverLetter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeData = location.state;
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(true);
  const [jobDetails, setJobDetails] = useState({
    companyName: '',
    jobTitle: '',
    recipientName: '',
    jobDescription: ''
  });

  useEffect(() => {
    console.log('Resume data received:', resumeData);
    if (!resumeData) {
      console.log('No resume data found, redirecting to editor');
      navigate('/editor');
      return;
    }
    
    if (!resumeData.name || !resumeData.email || !resumeData.contact) {
      console.log('Missing required resume fields:', { 
        name: resumeData.name, 
        email: resumeData.email, 
        contact: resumeData.contact 
      });
      setError('Resume is missing required fields. Please complete your resume first.');
      setTimeout(() => navigate('/editor'), 2000);
      return;
    }
  }, [resumeData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCoverLetter = async () => {
    if (!jobDetails.companyName || !jobDetails.jobDescription) {
      setError('Please fill in at least the company name and job description.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowForm(false);

    try {
      const response = await api.post('/ai/cover-letter', {
        resume: resumeData,
        ...jobDetails
      });

      if (response.data.coverLetter) {
        const formattedDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Remove any template language and clean up the response
        const cleanedLetter = response.data.coverLetter
          .replace(/^Here is a professional cover letter.*?\n/i, '') // Remove template intro
          .replace(/^Dear.*?\n\n/m, '') // Remove first "Dear" line if duplicated
          .trim();

        const letterWithHeader = `${formattedDate}

${resumeData.name}
${resumeData.email}
${resumeData.contact}
${resumeData.linkedin || ''}

${jobDetails.companyName}

Dear ${jobDetails.recipientName || 'Hiring Manager'},

${cleanedLetter}`;

        setCoverLetter(letterWithHeader);
      }
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
      console.error('Cover letter generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCoverLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover_letter_${jobDetails.companyName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Show feedback popup after download
    setTimeout(() => {
      if (!feedbackSubmitted) {
        setShowFeedbackPopup(true);
      }
    }, 1000);
  };

  const handleStartOver = () => {
    setCoverLetter('');
    setShowForm(true);
    setJobDetails({
      companyName: '',
      jobTitle: '',
      recipientName: '',
      jobDescription: ''
    });
  };

  const downloadAsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Set font
      doc.setFont("helvetica", "normal"); // Using Helvetica as it's closest to Calibri in PDF
      doc.setFontSize(11); // Standard size for professional documents
      
      const pageWidth = doc.internal.pageSize.width;
      const margin = 25; // 1 inch margin
      const lineHeight = 6.5;
      let y = margin;
      
      // Function to add text with proper line breaks
      const addText = (text, isHeader = false) => {
        if (isHeader) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach(line => {
          if (y > doc.internal.pageSize.height - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 2; // Add extra space between paragraphs
      };

      // Split the cover letter into sections
      const sections = coverLetter.split('\n\n');
      
      sections.forEach((section, index) => {
        // Add proper spacing between sections
        if (index > 0) {
          y += lineHeight/2;
        }
        
        // Handle each paragraph
        const lines = section.split('\n');
        lines.forEach((line, lineIndex) => {
          addText(line, lineIndex === 0 && index === 0); // Bold the first line of the first section (date)
        });
      });
      
      doc.save(`cover_letter_${jobDetails.companyName.replace(/\s+/g, '_')}.pdf`);
      
      // Show feedback popup after PDF download
      setTimeout(() => {
        if (!feedbackSubmitted) {
          setShowFeedbackPopup(true);
        }
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const downloadAsWord = () => {
    try {
      // Convert the cover letter to HTML format with proper styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Calibri, 'Segoe UI', sans-serif;
                font-size: 11pt;
                line-height: 1.15;
                margin: 1in;
                color: #000000;
              }
              .header {
                margin-bottom: 20pt;
              }
              .date {
                margin-bottom: 20pt;
              }
              .address {
                margin-bottom: 20pt;
              }
              .salutation {
                margin-bottom: 12pt;
              }
              .paragraph {
                margin-bottom: 12pt;
                text-align: justify;
              }
              .closing {
                margin-top: 20pt;
              }
            </style>
          </head>
          <body>
            ${coverLetter.split('\n\n').map((section, index) => {
              const lines = section.split('\n');
              if (index === 0) {
                // First section (date and contact info)
                return `<div class="header">
                  ${lines.map(line => `<div>${line}</div>`).join('\n')}
                </div>`;
              } else if (index === 1) {
                // Company address
                return `<div class="address">
                  ${lines.map(line => `<div>${line}</div>`).join('\n')}
                </div>`;
              } else if (section.toLowerCase().startsWith('dear')) {
                // Salutation
                return `<div class="salutation">${section}</div>`;
              } else if (section.toLowerCase().includes('sincerely') || 
                        section.toLowerCase().includes('best regards')) {
                // Closing
                return `<div class="closing">${section}</div>`;
              } else {
                // Regular paragraphs
                return `<div class="paragraph">${section}</div>`;
              }
            }).join('\n')}
          </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover_letter_${jobDetails.companyName.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show feedback popup after Word download
      setTimeout(() => {
        if (!feedbackSubmitted) {
          setShowFeedbackPopup(true);
        }
      }, 1000);
    } catch (error) {
      console.error('Error generating Word document:', error);
      setError('Failed to generate Word document. Please try again.');
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

  if (!resumeData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-[#1a237e] text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">AI Cover Letter Generator</h1>
            <button
              onClick={() => navigate('/resume-preview', { state: resumeData })}
              className="px-4 py-2 bg-white text-[#1a237e] rounded hover:bg-gray-100 transition-colors"
            >
              Back to Resume
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-b-lg p-6">
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          {showForm ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Enter Job Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name*
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={jobDetails.companyName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Enter the company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={jobDetails.jobTitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                    placeholder="Enter the job title"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hiring Manager's Name
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={jobDetails.recipientName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Enter the hiring manager's name (if known)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description*
                </label>
                <textarea
                  name="jobDescription"
                  value={jobDetails.jobDescription}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Paste the job description here"
                />
              </div>
              <button
                onClick={generateCoverLetter}
                className="w-full py-2 px-4 bg-[#1a237e] text-white rounded hover:bg-[#1a237e]/90 transition-colors"
              >
                Generate Cover Letter
              </button>
            </div>
          ) : isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a237e]"></div>
              <span className="ml-3">Generating your cover letter...</span>
            </div>
          ) : coverLetter ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Cover Letter</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 ${
                      isEditing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
                    } text-white rounded transition-colors`}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Letter'}
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Start Over
                  </button>
                  <div className="relative group">
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download As
                    </button>
                    <div className="absolute -bottom-2 left-0 right-0 h-2 bg-transparent"></div>
                    <div className="absolute right-0 top-[calc(100%-2px)] w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-10">
                      <div className="py-1">
                        <button
                          onClick={() => downloadCoverLetter()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Text (.txt)
                        </button>
                        <button
                          onClick={downloadAsPDF}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          PDF (.pdf)
                        </button>
                        <button
                          onClick={downloadAsWord}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Word (.doc)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isEditing ? (
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full h-[600px] p-6 bg-white border rounded font-serif focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              ) : (
                <div className="bg-gray-50 p-6 rounded whitespace-pre-wrap font-serif">
                  {coverLetter}
                </div>
              )}
              <button
                onClick={generateCoverLetter}
                className="mt-4 w-full py-2 px-4 bg-[#1a237e] text-white rounded hover:bg-[#1a237e]/90 transition-colors"
              >
                Regenerate Cover Letter
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {showFeedbackPopup && (
        <FeedbackPopup
          isOpen={showFeedbackPopup}
          onClose={handleFeedbackClose}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
};

export default CoverLetter;
