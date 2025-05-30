import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const parsedData = res.data; // Extracted JSON from PDF/DOCX
      localStorage.setItem('uploadedResume', JSON.stringify(parsedData));
      navigate('/resume-editor');
    } catch (err) {
      setMessage('Failed to upload or extract data from resume');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">Upload Your Resume</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          className="form-control mb-3"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button className="btn btn-primary w-100">Extract & Continue</button>
      </form>
      {message && <p className="mt-3 text-center text-danger">{message}</p>}
    </div>
  );
}
