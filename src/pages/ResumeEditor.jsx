import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';

const ResumeEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillData = location.state || {}; // Data passed from Resume Edit or AI suggestions

  // Resume state with pre-filled values if available
  const [resumeData, setResumeData] = useState({
    title: prefillData.title || '',
    name: prefillData.name || '',
    email: prefillData.email || '',
    contact: prefillData.contact || '',
    linkedin: prefillData.linkedin || '',
    jobTitle: prefillData.jobTitle || '',
    company: prefillData.company || '',
    duration: prefillData.duration || '',
    responsibilities: prefillData.responsibilities || '',
    degree: prefillData.degree || '',
    university: prefillData.university || '',
    year: prefillData.year || '',
    skills: Array.isArray(prefillData.skills) ? prefillData.skills : prefillData.skills?.split(',').map(s => s.trim()) || [],
    certifications: Array.isArray(prefillData.certifications) ? prefillData.certifications : [],
    summary: prefillData.summary || '',
    references: prefillData.references || ''
  });

  const [atsScore, setAtsScore] = useState(0); // AI ATS score
  const [suggestedSkills, setSuggestedSkills] = useState([]); // AI skill suggestions
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // Update state on input field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({ ...prev, [name]: value }));
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

  // Add certification if it's not already added
  const addCertification = () => {
    if (certInput && !resumeData.certifications.includes(certInput)) {
      setResumeData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certInput]
      }));
      setCertInput('');
    }
  };

  // Remove certification from list
  const removeCertification = (cert) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert)
    }));
  };

  // Use AI to enhance skill section based on current experience/education
  const handleAIEnhanceSkills = async () => {
    try {
      const res = await api.post('/api/ai/enhance-skills', {
        jobTitle: resumeData.jobTitle,
        responsibilities: resumeData.responsibilities,
        education: `${resumeData.degree} ${resumeData.university}`,
        currentSkills: resumeData.skills
      });
      setSuggestedSkills(res.data.enhancedSkills || []);
    } catch (err) {
      console.error('❌ Skill enhancement failed', err);
      alert('Could not enhance skills with AI');
    }
  };

  // Use AI to generate a professional summary
  const handleAISummary = async () => {
    try {
      const res = await api.post('/api/ai', resumeData);
      setResumeData((prev) => ({
        ...prev,
        summary: res.data.suggestedSummary || 'AI could not generate summary.'
      }));
    } catch (err) {
      console.error(err);
      alert('AI enhancement failed');
    }
  };

  // Save resume (new or edited)
  const handleSaveResume = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("You're not logged in.");

      const decoded = jwtDecode(token);
      const user_id = decoded.id;

      const content = { ...resumeData };
      const payload = {
        user_id,
        title: resumeData.title,
        content: JSON.stringify(content),
        template_id: 1 // Default template
      };

      const saveRes = await api.post('/api/resumes', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const savedResumeId = saveRes.data.resumeId;

      alert('✅ Resume saved successfully!');
      navigate('/resume-preview', {
        state: {
          ...resumeData,
          id: savedResumeId
        }
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '❌ Failed to save resume. Please try again.');
    }
  };

  // Get ATS score for resume
  const handleATSScore = async () => {
    try {
      const content = JSON.stringify(resumeData);
      const res = await api.post('/api/ats/ats-score', { content });
      setAtsScore(res.data.score || 0);
    } catch (err) {
      console.error('❌ ATS scoring failed', err);
      setAtsScore(0);
    }
  };

  // Auto-check ATS score when relevant fields change
  useEffect(() => {
    if (resumeData.name || resumeData.jobTitle || resumeData.skills.length) {
      handleATSScore();
    }
  }, [resumeData]);

  return (
    <div className="container mt-5">
      <h2>Resume Input Form</h2>

      {/* Resume Title */}
      <div className="mb-3">
        <label className="form-label fw-bold">Resume Title</label>
        <input
          className="form-control"
          name="title"
          value={resumeData.title}
          onChange={handleChange}
          placeholder="e.g., Full Stack Developer Resume"
        />
      </div>

      {/* Personal Info Fields */}
      <h5 className="mt-4">Personal Information</h5>
      {["name", "email", "contact", "linkedin"].map((field) => (
        <input
          key={field}
          className="form-control my-2"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          name={field}
          value={resumeData[field]}
          onChange={handleChange}
        />
      ))}
      <button className="btn btn-primary w-100 mb-3">Fill From LinkedIn</button>

      {/* Work Experience */}
      <h5>Work Experience</h5>
      {["jobTitle", "company", "duration", "responsibilities"].map((field) => (
        <input
          key={field}
          className="form-control my-2"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          name={field}
          value={resumeData[field]}
          onChange={handleChange}
        />
      ))}

      {/* Education */}
      <h5>Education</h5>
      {["degree", "university", "year"].map((field) => (
        <input
          key={field}
          className="form-control my-2"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          name={field}
          value={resumeData[field]}
          onChange={handleChange}
        />
      ))}

      {/* Skills */}
      <h5>Skills</h5>
      <input
        className="form-control my-2"
        placeholder="Type a skill"
        value={skillInput}
        onChange={handleSkillInputChange}
      />
      <div className="d-flex flex-wrap gap-2 mb-2">
        {resumeData.skills.map((skill, index) => (
          <span key={index} className="badge bg-success p-2">
            {skill}{' '}
            <button onClick={() => removeSkill(skill)} className="btn-close btn-close-white btn-sm ms-2"></button>
          </span>
        ))}
      </div>
      {suggestedSkills.length > 0 && (
        <div className="mb-2">
          <strong>Suggestions:</strong>
          <div className="d-flex flex-wrap gap-2">
            {suggestedSkills.map((s, idx) => (
              <button key={idx} className="btn btn-outline-secondary btn-sm" onClick={() => addSkill(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <button className="btn btn-primary w-100 mb-3" onClick={handleAIEnhanceSkills}>
        Enhance Skills with AI
      </button>

      {/* Certifications */}
      <h5>Certifications</h5>
      <div className="input-group mb-2">
        <input
          className="form-control"
          placeholder="Add Certification"
          value={certInput}
          onChange={(e) => setCertInput(e.target.value)}
        />
        <button className="btn btn-outline-primary" onClick={addCertification}>Add</button>
      </div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {resumeData.certifications.map((cert, index) => (
          <span key={index} className="badge bg-info text-dark p-2">
            {cert}{' '}
            <button onClick={() => removeCertification(cert)} className="btn-close btn-close-white btn-sm ms-2"></button>
          </span>
        ))}
      </div>

      {/* Summary */}
      <h5>Summary Section</h5>
      <textarea
        className="form-control mb-2"
        placeholder="AI-powered auto-generated summary"
        name="summary"
        rows={6}
        value={resumeData.summary}
        onChange={handleChange}
      />
      <button className="btn btn-primary w-100 mb-3" onClick={handleAISummary}>
        Regenerate with AI
      </button>

      {/* References */}
      <h5>References</h5>
      <textarea
        className="form-control mb-3"
        placeholder="Include references here (if any)"
        name="references"
        rows={3}
        value={resumeData.references}
        onChange={handleChange}
      />

      {/* Save Button */}
      <button className="btn btn-success w-100" onClick={handleSaveResume}>
        Submit
      </button>

      {/* ATS Feedback */}
      <div className="bg-light p-3 mt-4">
        <strong>Live AI Feedback Panel:</strong>
        <p className="mb-0">Highlights ATS-optimized suggestions.</p>
        <p className="mb-0">ATS Compliance: {atsScore}%</p>
      </div>
    </div>
  );
};

export default ResumeEditor;
