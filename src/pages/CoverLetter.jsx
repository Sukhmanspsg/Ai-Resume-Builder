// TemplatePreview.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResumePreview = () => {
  // Access resume data passed via navigation state
  const { state: resume } = useLocation();
  const navigate = useNavigate();

  // State variables
  const [atsScore, setAtsScore] = useState(null); // ATS score result
  const [aiSuggestions, setAiSuggestions] = useState([]); // AI feedback
  const [templates, setTemplates] = useState([]); // List of available templates
  const [renderedHtml, setRenderedHtml] = useState(''); // Final rendered HTML for preview/download

  // Fetch available resume templates from the backend
  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch templates', err);
    }
  };

  // Generate a new resume template using AI
  const handleGenerateTemplate = async () => {
    const userPrompt = prompt('Describe the kind of resume template you want:');
    if (!userPrompt) return;

    try {
      await api.post('/api/templates/generate-with-ai', { userPrompt });
      alert('✅ New template generated!');
      fetchTemplates(); // Refresh templates list
    } catch (err) {
      console.error('❌ AI generation failed:', err);
      alert('Failed to generate template');
    }
  };

  useEffect(() => {
    // Fetch ATS score for the current resume
    const fetchATSScore = async () => {
      try {
        const content = JSON.stringify(resume);
        const res = await api.post('/api/ats/ats-score', { content });
        setAtsScore(res.data.score);
      } catch (err) {
        console.error('❌ ATS scoring failed', err);
        setAtsScore('N/A');
      }
    };

    // Fetch AI improvement suggestions
    const fetchAISuggestions = async () => {
      try {
        const res = await api.post('/api/ai/suggestions', { resume });
        if (res.data.suggestions) {
          setAiSuggestions(res.data.suggestions);
        } else {
          setAiSuggestions(['Use more quantifiable results', 'Include relevant certifications']);
        }
      } catch (err) {
        console.error('❌ AI suggestions failed', err);
        setAiSuggestions(['Use more quantifiable results', 'Include relevant certifications']);
      }
    };

    // Load data when resume exists
    if (resume && Object.keys(resume).length > 0) {
      fetchATSScore();
      fetchAISuggestions();
      fetchTemplates();
    }
  }, [resume]);

  // Apply AI suggestions to resume and navigate to the editor with the updated version
  const applyAISuggestions = async () => {
    try {
      const res = await api.post('/api/ai/apply-suggestions', { resume });
      if (res.data.updatedResume) {
        navigate('/editor', { state: res.data.updatedResume });
      } else {
        alert('No improvements returned.');
      }
    } catch (err) {
      console.error('❌ Failed to apply AI improvements', err);
      alert('AI improvement failed');
    }
  };

  // Render selected template with resume data
  const handlePreview = async (templateId) => {
    try {
      const res = await api.get(`/api/templates/${templateId}`);
      let html = res.data.html_code;

      // Safely extract fields from resume object
      const {
        name = '',
        contact = '',
        linkedin = '',
        summary = '',
        jobTitle = '',
        company = '',
        duration = '',
        responsibilities = '',
        degree = '',
        university = '',
        year = '',
        references = ''
      } = resume;

      const skills = Array.isArray(resume.skills)
        ? resume.skills.join(', ')
        : resume.skills || '';

      const certifications = Array.isArray(resume.certifications)
        ? resume.certifications.join(', ')
        : resume.certifications || '';

      const education = `${degree} — ${university} (${year})`;
      const experience = `${jobTitle} at ${company} (${duration})<br/>${responsibilities}`;

      // Replace placeholders with actual resume values
      html = html
        .replace(/{{name}}/g, name)
        .replace(/{{contact}}/g, contact)
        .replace(/{{linkedin}}/g, linkedin)
        .replace(/{{summary}}/g, summary)
        .replace(/{{jobTitle}}/g, jobTitle)
        .replace(/{{company}}/g, company)
        .replace(/{{duration}}/g, duration)
        .replace(/{{responsibilities}}/g, responsibilities)
        .replace(/{{degree}}/g, degree)
        .replace(/{{university}}/g, university)
        .replace(/{{year}}/g, year)
        .replace(/{{skills}}/g, skills)
        .replace(/{{certifications}}/g, certifications)
        .replace(/{{references}}/g, references)
        .replace(/{{education}}/g, education)
        .replace(/{{experience}}/g, experience);

      setRenderedHtml(html); // Set final preview
    } catch (err) {
      console.error('❌ Template preview failed', err);
      setRenderedHtml('<p class="text-danger">No preview returned.</p>');
    }
  };

  // Download rendered HTML as a file
  const handleDownload = () => {
    const blob = new Blob([renderedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-5">
      <h2>AI-Powered Cover Letter Generator</h2>
      <p>Our AI will generate a tailored cover letter based on your resume.</p>

      <div className="row">
        {/* Resume Info Box */}
        <div className="col-md-6">
          <div className="border p-3 rounded bg-white">
            <h5><strong>Your Resume Preview</strong></h5>
            <div className="p-3" style={{ border: '2px dashed #ccc', minHeight: '300px' }}>
              <h6><strong>{resume.name}</strong></h6>
              <p>{resume.contact}</p>
              <p><a href={resume.linkedin} target="_blank" rel="noopener noreferrer">{resume.linkedin}</a></p>
              <p><em>{resume.summary}</em></p>
              <p><strong>Experience:</strong> {resume.jobTitle} at {resume.company} ({resume.duration})</p>
              <p>{resume.responsibilities}</p>
              <p><strong>Education:</strong> {resume.degree} — {resume.university} ({resume.year})</p>
              <p><strong>Skills:</strong> {Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}</p>
              <p><strong>Certifications:</strong> {Array.isArray(resume.certifications) ? resume.certifications.join(', ') : resume.certifications}</p>
            </div>
            <button className="btn btn-warning mt-3" onClick={handleGenerateTemplate}>
              Generate New Template with AI
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="col-md-6">
          <div className="border p-3 rounded bg-white">
            <h5><strong>Choose a Resume Template</strong></h5>
            <p>Select a design to preview your resume with different styles.</p>
            <div className="row">
              {templates.map(template => (
                <div key={template.id} className="col-md-6 mb-3">
                  <div className="border p-2 rounded" style={{ height: '150px', backgroundColor: '#f8f9fa' }}>
                    <h6>{template.name}</h6>
                    <p className="text-muted small">{template.description}</p>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handlePreview(template.id)}>Preview</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview + Download Section */}
      {renderedHtml && (
        <div className="mt-4 p-4 border rounded bg-white">
          <h5>Live Preview:</h5>
          <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />

          <div className="mt-4 text-center">
            <h5>Download Your Resume</h5>
            <button className="btn btn-primary px-5" onClick={handleDownload}>
              Download
            </button>
            <p className="mt-2">Shareable Resume Link: <a href="#">[Link]</a></p>
            <button
              className="btn btn-secondary mt-2"
              onClick={() => navigate('/editor', { state: resume })}
            >
              Go Back & Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
