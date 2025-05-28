import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResumePreview = () => {
  const { state: resume } = useLocation(); // Resume data passed via route state
  const navigate = useNavigate();

  // State to store ATS score and AI suggestions
  const [atsScore, setAtsScore] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    // Fetch ATS score for the current resume
    const fetchATSScore = async () => {
      try {
        const content = JSON.stringify(resume); // Resume content in string format
        const res = await api.post('/api/ats/ats-score', { content });
        setAtsScore(res.data.score);
      } catch (err) {
        console.error('❌ ATS scoring failed', err);
        setAtsScore('N/A');
      }
    };

    // Fetch AI suggestions for resume improvement
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

    // Trigger both functions if resume data exists
    if (resume && Object.keys(resume).length > 0) {
      fetchATSScore();
      fetchAISuggestions();
    }
  }, [resume]);

  // Apply AI-generated suggestions and redirect user to edit page
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

  return (
    <div className="container mt-5">
      <h2>Resume Preview</h2>

      {/* Resume Details Box */}
      <div className="border p-4 rounded bg-white">
        <h6><strong>{resume.name}</strong></h6>
        <p>{resume.contact}</p>
        <p>
          <a href={resume.linkedin} target="_blank" rel="noopener noreferrer">
            {resume.linkedin}
          </a>
        </p>
        <p><em>{resume.summary}</em></p>

        <h6><strong>Work Experience:</strong></h6>
        <p>{resume.jobTitle} at {resume.company} ({resume.duration})</p>
        <p>{resume.responsibilities}</p>

        <h6><strong>Education:</strong></h6>
        <p>{resume.degree} — {resume.university} ({resume.year})</p>

        <h6><strong>Skills:</strong></h6>
        <p>{Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}</p>

        <h6><strong>Certifications:</strong></h6>
        <p>{Array.isArray(resume.certifications) ? resume.certifications.join(', ') : resume.certifications}</p>

        <h6><strong>References:</strong></h6>
        <p>{resume.references}</p>
      </div>

      {/* AI Feedback Section */}
      <div className="mt-4">
        <h6>
          Your resume is missing this (<span className="text-primary">AI Suggestion</span>)
        </h6>

        <div className="border p-3 rounded bg-light">
          <p>Add this to improve your resume:</p>
          <ul>
            {aiSuggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <button
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/CoverLetter', { state: resume })}
        >
          Continue with this Resume
        </button>

        <button
          className="btn btn-primary mt-3 ms-3"
          onClick={applyAISuggestions}
        >
          Apply AI Improvements
        </button>

        {/* AI Feedback Summary */}
        <div className="mt-3">
          <small>
            <strong>AI Suggestions:</strong><br />
            {aiSuggestions[0]}
          </small><br />
          <small>
            <strong>ATS Score:</strong> {atsScore !== null ? `${atsScore}%` : 'Loading...'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
