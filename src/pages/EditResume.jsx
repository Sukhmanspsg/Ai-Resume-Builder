import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // (Not used in this file but imported; can be removed if unnecessary)

const EditResume = () => {
  const { id } = useParams(); // Get resume ID from URL params
  const navigate = useNavigate();

  // State to hold resume fields
  const [resumeData, setResumeData] = useState({
    title: '',
    name: '',
    education: '',
    experience: '',
    skills: '',
    summary: ''
  });

  // Fetch resume data on component mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await api.get(`/resumes/${id}`); // API call to get resume
        const data = JSON.parse(res.data.content);   // Resume content is stored as JSON string

        // Populate state with fetched data
        setResumeData({
          title: res.data.title,
          name: data.name,
          education: data.education,
          experience: data.experience,
          skills: data.skills,
          summary: data.summary
        });
      } catch (err) {
        console.error('Error loading resume:', err);
      }
    };

    fetchResume();
  }, [id]);

  // Handle input changes and update local state
  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  // Update the resume data on the server
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token'); // Get auth token from localStorage

      // Construct updated resume content
      const updatedContent = {
        name: resumeData.name,
        education: resumeData.education,
        experience: resumeData.experience,
        skills: resumeData.skills,
        summary: resumeData.summary
      };

      // PUT request to update the resume
      await api.put(`/resumes/${id}`, {
        title: resumeData.title,
        template_id: 1, // Template ID is hardcoded here
        content: updatedContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Resume updated successfully!');
      navigate('/MyResumes'); // Redirect after success
    } catch (err) {
      console.error('Update failed:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Edit Resume</h2>

      {/* Dynamically generate form fields for each resume field */}
      {['title', 'name', 'education', 'experience', 'skills', 'summary'].map((field) => (
        <div key={field} className="mb-3">
          <label className="form-label text-capitalize">{field}</label>
          <textarea
            className="form-control"
            name={field}
            rows={field === 'summary' ? 6 : 2} // Larger textarea for summary
            value={resumeData[field]}
            onChange={handleChange}
          />
        </div>
      ))}

      {/* Submit button */}
      <button className="btn btn-primary" onClick={handleUpdate}>
        Update Resume
      </button>
    </div>
  );
};

export default EditResume;
