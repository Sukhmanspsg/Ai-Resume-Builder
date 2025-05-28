import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const MyResumes = () => {
  // State to hold the list of resumes
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();

  // Fetch resumes associated with the logged-in user
  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from local storage
      const decoded = jwtDecode(token); // Decode token to get user ID
      const userId = decoded.id;

      // API call to fetch user's resumes
      const res = await api.get(`/api/resumes/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResumes(res.data); // Store fetched resumes in state
    } catch (err) {
      console.error('Error fetching resumes', err);
    }
  };

  // Fetch resumes once component mounts
  useEffect(() => {
    fetchResumes();
  }, []);

  // Handle deleting a resume
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Resume deleted!');
      fetchResumes(); // Refresh list after deletion
    } catch (err) {
      console.error('Failed to delete resume', err);
      alert('Error deleting resume');
    }
  };

  // Navigate to the editor with existing resume data
  const handleEdit = (resume) => {
    const resumeData = JSON.parse(resume.content); // Parse stored JSON content
    navigate('/editor', { state: resumeData }); // Pass data to editor route
  };

  return (
    <div className="container mt-5">
      <h2>Your Saved Resumes</h2>

      {/* Loop through and display each resume */}
      {resumes.map((resume, index) => {
        let data = {};
        try {
          // Parse resume content safely
          data = JSON.parse(resume.content || '{}');
        } catch (err) {
          console.error('Failed to parse resume content:', resume.content, err);
        }

        return (
          <div key={index} className="card my-4 p-4 shadow">
            <h4 className="text-primary">{resume.title}</h4>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Education:</strong> {data.education}</p>
            <p><strong>Experience:</strong> {data.experience}</p>
            <p><strong>Skills:</strong> {data.skills}</p>
            <p><strong>Summary:</strong> {data.summary}</p>
            <p className="text-muted">
              <em>Created on: {new Date(resume.created_at).toLocaleString()}</em>
            </p>

            {/* Action buttons */}
            <div className="d-flex gap-2">
              <button className="btn btn-warning" onClick={() => handleEdit(resume)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(resume.id)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyResumes;
