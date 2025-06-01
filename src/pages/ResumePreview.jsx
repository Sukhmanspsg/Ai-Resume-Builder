import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Tab, TabStopPosition, TabStopType } from 'docx';
import DefaultTemplate from '../components/DefaultTemplate';
import ModernTemplate from '../components/ModernTemplate';
import MinimalTemplate from '../components/MinimalTemplate';
import FeedbackPopup from '../components/FeedbackPopup';
import ReactDOMServer from 'react-dom/server';
import { calculateATSScore } from '../utils/atsScoring';

const ResumePreview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(state);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Get template from state or default to 'default'
  const selectedTemplate = state?.selectedTemplate || 'default';
  const selectedColor = state?.selectedColor || '#1A237E';
  
  const templates = {
    default: DefaultTemplate,
    modern: ModernTemplate,
    minimal: MinimalTemplate
  };

  // Get the current template component
  const TemplateComponent = templates[selectedTemplate];

  // Redirect if no resume data
  useEffect(() => {
    if (!resumeData) {
      alert('No resume data found');
      navigate('/editor');
    }
  }, [resumeData, navigate]);

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
    const suggestions = {
      summary: [],
      experience: [],
      skills: [],
      education: [],
      overall: []
    };

    // Analyze summary
    if (!resume.summary || resume.summary.length < 50) {
      suggestions.summary.push('Add a more detailed professional summary (aim for 3-4 impactful sentences)');
    }
    if (!resume.summary?.includes('years of experience')) {
      suggestions.summary.push('Include your total years of experience in your summary');
    }
    if (!resume.summary?.match(/\d+/)) {
      suggestions.summary.push('Add quantifiable achievements or metrics to your summary');
    }

    // Analyze work experience
    if (resume.workExperience) {
      resume.workExperience.forEach((exp, index) => {
        if (!exp.responsibilities.includes('%') && !exp.responsibilities.includes('increased') && !exp.responsibilities.includes('decreased')) {
          suggestions.experience.push(`Add quantifiable results to your role at ${exp.company} (e.g., "Increased efficiency by 25%")`);
        }
        if (!exp.responsibilities.match(/^(Led|Managed|Developed|Created|Implemented)/m)) {
          suggestions.experience.push(`Start your bullet points for ${exp.company} with strong action verbs`);
        }
        if (exp.responsibilities.split('\n').length < 3) {
          suggestions.experience.push(`Add more achievements for your role at ${exp.company} (aim for 3-5 bullet points)`);
        }
      });
    }

    // Analyze skills
    if (!resume.skills || resume.skills.length < 8) {
      suggestions.skills.push('Add more relevant technical and soft skills (aim for 8-12 key skills)');
    }
    const technicalSkills = ['programming', 'software', 'java', 'python', 'javascript', 'react', 'node', 'database', 'aws', 'cloud'];
    const hasTechnicalSkills = resume.skills?.some(skill => 
      technicalSkills.some(tech => skill.toLowerCase().includes(tech))
    );
    if (!hasTechnicalSkills) {
      suggestions.skills.push('Include specific technical skills relevant to your field');
    }
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical'];
    const hasSoftSkills = resume.skills?.some(skill => 
      softSkills.some(soft => skill.toLowerCase().includes(soft))
    );
    if (!hasSoftSkills) {
      suggestions.skills.push('Add soft skills like leadership, communication, or problem-solving');
    }

    // Analyze education
    if (resume.education) {
      resume.education.forEach(edu => {
        if (!edu.year) {
          suggestions.education.push('Add graduation year for ${edu.degree}');
        }
        if (!edu.degree?.includes('Bachelor') && !edu.degree?.includes('Master') && !edu.degree?.includes('PhD')) {
          suggestions.education.push('Specify the type of degree (Bachelor\'s, Master\'s, etc.)');
        }
      });
    }

    // Overall recommendations
    if (!resume.linkedin) {
      suggestions.overall.push('Add your LinkedIn profile URL');
    }
    if (!resume.certifications || resume.certifications.length === 0) {
      suggestions.overall.push('Consider adding relevant certifications to strengthen your credentials');
    }
    suggestions.overall.push('Ensure your resume is tailored for specific job descriptions');
    suggestions.overall.push('Use industry-specific keywords throughout your resume');

    return suggestions;
  };

  useEffect(() => {
    const analyzeResume = async () => {
      if (resumeData && Object.keys(resumeData).length > 0) {
        setIsAnalyzing(true);
        try {
          // Calculate ATS score using the shared scoring function
          const score = calculateATSScore(resumeData);
          setAtsScore(score);

          // Generate specific suggestions based on resume content
          const suggestions = generateSpecificSuggestions(resumeData);
          setAiSuggestions(suggestions);
        } catch (err) {
          console.error('❌ Resume analysis failed', err);
          setAtsScore(null);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeResume();
  }, [resumeData]);

  // Apply AI-generated suggestions and redirect user to edit page
  const applyAISuggestions = async () => {
    try {
      const res = await api.post('/ai/apply-suggestions', { resume: resumeData });
      if (res.data.improvedResume || res.data.updatedResume) {
        const updatedResume = res.data.improvedResume || res.data.updatedResume;
        setResumeData(updatedResume);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Navigate to editor with the improved resume
          navigate('/editor', { 
            state: {
              ...updatedResume,
              id: resumeData.id // Preserve the resume ID
            }
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to apply AI improvements:', err);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  // Function to handle downloads
  const handleDownload = async (type) => {
    try {
      if (type === 'pdf') {
        // Get the rendered HTML from DefaultTemplate
        const templateHtml = ReactDOMServer.renderToString(<TemplateComponent resume={resumeData} primaryColor={selectedColor} />);
        
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
        
        // Create a temporary container for the template
        const container = document.createElement('div');
        container.innerHTML = templateHtml;
        container.id = 'resume-content';
        document.body.appendChild(container);
        document.head.appendChild(style);
        
        // Print
        window.print();
        
        // Cleanup
        document.body.removeChild(container);
        document.head.removeChild(style);

        // Show feedback popup after PDF download
        setTimeout(() => {
          if (!feedbackSubmitted) {
            setShowFeedbackPopup(true);
          }
        }, 1000);

      } else if (type === 'word') {
        // Define consistent styles matching the preview exactly
        const styles = {
          headerBackground: {
            size: 32,
            bold: true,
            color: "FFFFFF", // White text
            spacing: { after: 300 }
          },
          headerContactWhite: {
            size: 20,
            color: "FFFFFF", // White text
            spacing: { after: 100 }
          },
          sectionTitle: {
            size: 24,
            bold: true,
            color: "1A237E",
            spacing: { before: 400, after: 200 },
            border: {
              bottom: {
                color: "1A237E",
                style: BorderStyle.SINGLE,
                size: 1,
              },
            }
          },
          jobTitle: {
            size: 22,
            bold: true,
            color: "1A237E"
          },
          companyName: {
            size: 20,
            color: "1A237E"
          },
          duration: {
            size: 20,
            color: "666666",
            italics: true
          },
          bulletPoint: {
            size: 20,
            color: "666666",
            spacing: { after: 100 }
          },
          skillTag: {
            size: 18,
            color: "666666"
          }
        };

        const sections = [
          // Header background paragraph
          new Paragraph({
            children: [
              new TextRun({
                text: "",
              })
            ],
            shading: {
              fill: "1A237E", // Blue background
              color: "1A237E",
              val: "clear"
            },
            spacing: { before: 0 }
          }),

          // Header with name (centered)
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.name,
                ...styles.headerBackground,
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            shading: {
              fill: "1A237E", // Blue background
              color: "1A237E",
              val: "clear"
            }
          }),

          // Contact info (centered)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${resumeData.email} | ${resumeData.contact}`,
                ...styles.headerContactWhite
              }),
            ],
            spacing: { after: 200 },
            shading: {
              fill: "1A237E", // Blue background
              color: "1A237E",
              val: "clear"
            }
          }),

          // LinkedIn (centered)
          resumeData.linkedin ? new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: resumeData.linkedin,
                ...styles.headerContactWhite,
                underline: {}
              })
            ],
            spacing: { after: 400 },
            shading: {
              fill: "1A237E", // Blue background
              color: "1A237E",
              val: "clear"
            }
          }) : null,

          // Professional Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Summary",
                ...styles.sectionTitle
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.summary || "Professional seeking new opportunities.",
                ...styles.bulletPoint
              })
            ],
            spacing: { after: 400 }
          }),

          // Work Experience
          new Paragraph({
            children: [
              new TextRun({
                text: "Work Experience",
                ...styles.sectionTitle
              })
            ],
            spacing: { after: 200 }
          }),
          ...resumeData.workExperience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  ...styles.jobTitle
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company,
                  ...styles.companyName
                }),
                new TextRun({
                  text: ` | ${exp.duration}`,
                  ...styles.duration
                })
              ],
              spacing: { after: 200 }
            }),
            // Split responsibilities by line breaks and create bullet points
            ...exp.responsibilities.split('\n').filter(resp => resp.trim()).map(resp =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• ",
                    ...styles.bulletPoint,
                    bold: true
                  }),
                  new TextRun({
                    text: resp.trim().replace(/^[•\-\+\*]\s*/, ''),
                    ...styles.bulletPoint
                  })
                ],
                indent: {
                  left: 360
                },
                spacing: { after: 100 }
              })
            ),
            new Paragraph({
              children: [new TextRun({ text: "", size: 10 })],
              spacing: { after: 200 }
            })
          ]),

          // Education
          new Paragraph({
            children: [
              new TextRun({
                text: "Education",
                ...styles.sectionTitle
              })
            ],
            spacing: { after: 200 }
          }),
          ...resumeData.education.map(edu =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree} - ${edu.university} (${edu.year})`,
                  ...styles.bulletPoint
                })
              ],
              spacing: { after: 100 }
            })
          ),

          // Skills
          new Paragraph({
            children: [
              new TextRun({
                text: "Skills",
                ...styles.sectionTitle
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.skills.join(' • '),
                ...styles.skillTag
              })
            ],
            spacing: { after: 200 }
          })
        ];

        // Add Certifications if any
        if (resumeData.certifications?.length > 0) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "Certifications",
                  ...styles.sectionTitle
                })
              ],
              spacing: { after: 200 }
            }),
            ...resumeData.certifications.map(cert =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• ",
                    ...styles.bulletPoint,
                    bold: true
                  }),
                  new TextRun({
                    text: cert,
                    ...styles.bulletPoint
                  })
                ],
                indent: {
                  left: 360
                },
                spacing: { after: 100 }
              })
            )
          );
        }

        // Add References if any
        if (resumeData.references) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "References",
                  ...styles.sectionTitle
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.references,
                  ...styles.bulletPoint
                })
              ],
              spacing: { after: 200 }
            })
          );
        }

        // Create and download the Word document
        const doc = new Document({
          sections: [{
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  right: 1440,
                  bottom: 1440,
                  left: 1440
                }
              }
            },
            children: sections.filter(Boolean)
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

  const renderSuggestionSection = (title, suggestions, icon) => (
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
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload('pdf')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                </span>
                PDF
              </button>
              <button
                onClick={() => handleDownload('word')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </span>
                Word
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Resume Preview Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            {/* Resume Content using selected Template */}
            <div id="resume-content">
              <TemplateComponent 
                resume={resumeData} 
                primaryColor={selectedColor}
              />
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden no-print">
            <div className="p-6 border-b border-gray-200 bg-black text-white">
              <h2 className="text-xl font-bold">AI Resume Analysis</h2>
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
                        {atsScore !== null ? `${atsScore}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Suggestions */}
                  <div className="space-y-6">
                    {renderSuggestionSection("Professional Summary Improvements", aiSuggestions.summary, 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}

                    {renderSuggestionSection("Work Experience Enhancements", aiSuggestions.experience,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}

                    {renderSuggestionSection("Skills Recommendations", aiSuggestions.skills,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}

                    {renderSuggestionSection("Education Improvements", aiSuggestions.education,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    )}

                    {renderSuggestionSection("Overall Recommendations", aiSuggestions.overall,
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>

                  {/* Main Action Buttons */}
                  <div className="flex justify-center space-x-4 mt-8">
                    <button
                      onClick={applyAISuggestions}
                      className="px-8 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#4CAF50]/90 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Apply AI Improvements
                    </button>
                    <button
                      onClick={() => navigate('/templates', { state: resumeData })}
                      className="px-8 py-3 bg-[#1A237E] text-white rounded-lg hover:bg-[#1A237E]/90 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                      </svg>
                      Change Template
                    </button>
                    <button
                      onClick={() => navigate('/cover-letter', { state: resumeData })}
                      className="px-8 py-3 bg-[#3F51B5] text-white rounded-lg hover:bg-[#3F51B5]/90 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Create Cover Letter
                    </button>
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
    </div>
  );
};

export default ResumePreview;
