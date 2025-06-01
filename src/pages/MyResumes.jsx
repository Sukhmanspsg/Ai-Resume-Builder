import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const MyResumes = () => {
  // State to hold the list of resumes
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch resumes associated with the logged-in user
  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token'); // Get token from local storage
      console.log('🔍 Debug - Token exists:', !!token);
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      
      const decoded = jwtDecode(token); // Decode token to get user ID
      const userId = decoded.id;
      console.log('🔍 Debug - Decoded user ID:', userId);

      // API call to fetch user's resumes
      console.log('🔍 Debug - Making API call to:', `/api/resumes/user/${userId}`);
      
      const res = await api.get(`/resumes/user/${userId}`);
      console.log('🔍 Debug - API response:', res.data);
      console.log('🔍 Debug - Number of resumes found:', res.data.length);

      setResumes(res.data); // Store fetched resumes in state
    } catch (err) {
      console.error('❌ Error fetching resumes:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(`Failed to fetch resumes: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resumes once component mounts
  useEffect(() => {
    fetchResumes();
  }, []);

  // Handle deleting a resume
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/resumes/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Navigate to preview page
  const handlePreview = (resume) => {
    const resumeData = JSON.parse(resume.content);
    navigate('/preview', { state: resumeData });
  };

  // Helper function to safely render complex data
  const renderField = (field, fieldName) => {
    if (!field) return 'Not specified';
    
    // If it's a string, return as is
    if (typeof field === 'string') return field;
    
    // If it's an array, join or format appropriately
    if (Array.isArray(field)) {
      if (field.length === 0) return 'Not specified';
      
      // Handle education array
      if (fieldName === 'education' && field[0] && typeof field[0] === 'object') {
        return field.map(edu => 
          `${edu.degree || ''} ${edu.university || ''} (${edu.year || ''})`
        ).filter(edu => edu.trim() !== ' ()').join(', ');
      }
      
      // Handle workExperience array (this is the correct field name)
      if (fieldName === 'workExperience' && field[0] && typeof field[0] === 'object') {
        return field.map(exp => 
          `${exp.title || exp.position || ''} at ${exp.company || ''}`
        ).filter(exp => exp.trim() !== ' at ').join(', ');
      }
      
      // Handle skills array (usually strings)
      if (fieldName === 'skills') {
        return field.join(', ');
      }
      
      // Default array handling
      return field.join(', ');
    }
    
    // If it's an object, try to extract meaningful information
    if (typeof field === 'object') {
      if (fieldName === 'education') {
        return `${field.degree || ''} ${field.university || ''} (${field.year || ''})`.trim();
      }
      if (fieldName === 'workExperience') {
        return `${field.title || field.position || ''} at ${field.company || ''}`.trim();
      }
      // For other objects, try to join values
      return Object.values(field).filter(val => val).join(', ');
    }
    
    return String(field);
  };

  // Mini resume preview component
  const MiniResumePreview = ({ resume, data }) => {
    const primaryColor = '#1A237E';
    
    // Helper function to safely get skills as array
    const getSkillsArray = (skills) => {
      if (!skills) return [];
      if (Array.isArray(skills)) return skills;
      if (typeof skills === 'string') {
        // If it's a string, try to split by comma or other delimiters
        return skills.split(/[,;|]/).map(skill => skill.trim()).filter(skill => skill);
      }
      // If it's an object, try to get values
      if (typeof skills === 'object') {
        return Object.values(skills).filter(skill => skill);
      }
      return [];
    };

    // Helper function to safely get work experience as array
    const getWorkExperienceArray = (workExp) => {
      if (!workExp) return [];
      if (Array.isArray(workExp)) return workExp;
      if (typeof workExp === 'object') return [workExp];
      return [];
    };

    // Helper function to safely get education as array
    const getEducationArray = (education) => {
      if (!education) return [];
      if (Array.isArray(education)) return education;
      if (typeof education === 'object') return [education];
      return [];
    };

    const skillsArray = getSkillsArray(data.skills);
    const workExperienceArray = getWorkExperienceArray(data.workExperience);
    const educationArray = getEducationArray(data.education);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 h-64 overflow-hidden relative">
        {/* Header */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold mb-1 text-gray-800 truncate" style={{color: primaryColor}}>
            {data.name || 'Unnamed'}
          </h3>
          <div className="text-xs text-gray-500 truncate">
            {data.email || data.contact || 'No contact info'}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1" style={{color: primaryColor}}>Summary</h4>
            <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
              {data.summary.substring(0, 80)}...
            </p>
          </div>
        )}

        {/* Experience */}
        {workExperienceArray.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1" style={{color: primaryColor}}>Experience</h4>
            <div className="text-xs text-gray-600">
              {workExperienceArray.slice(0, 1).map((exp, idx) => (
                <div key={idx} className="truncate">
                  <span className="font-medium">{exp.title || exp.position || 'Position'}</span> at {exp.company || 'Company'}
                </div>
              ))}
              {workExperienceArray.length > 1 && (
                <div className="text-xs text-gray-400">+{workExperienceArray.length - 1} more</div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {skillsArray.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1" style={{color: primaryColor}}>Skills</h4>
            <div className="flex flex-wrap gap-1">
              {skillsArray.slice(0, 4).map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{backgroundColor: primaryColor, fontSize: '10px'}}
                >
                  {skill}
                </span>
              ))}
              {skillsArray.length > 4 && (
                <span className="text-xs text-gray-400">+{skillsArray.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {educationArray.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1" style={{color: primaryColor}}>Education</h4>
            <div className="text-xs text-gray-600 truncate">
              {educationArray[0].degree || 'Degree'} - {educationArray[0].university || educationArray[0].school || 'University'}
            </div>
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1">
          <button 
            className="flex-1 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => handlePreview(resume)}
          >
            Preview
          </button>
          <button 
            className="flex-1 bg-yellow-500 text-white text-xs py-1 px-2 rounded hover:bg-yellow-600 transition-colors"
            onClick={() => handleEdit(resume)}
          >
            Edit
          </button>
          <button 
            className="flex-1 bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600 transition-colors"
            onClick={() => handleDelete(resume.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-blue-600" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Resumes</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={fetchResumes}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Resume Collection</h1>
          <p className="text-gray-600">
            {resumes.length === 0 ? 'No resumes found' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} in your collection`}
          </p>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-6">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No Resumes Yet</h3>
            <p className="text-gray-600 mb-6">Start building your professional resume collection</p>
            <a 
              href="/editor"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Resume
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {resumes.map((resume, index) => {
              let data = {};
              try {
                data = JSON.parse(resume.content || '{}');
              } catch (err) {
                console.error('Failed to parse resume content:', resume.content, err);
                data = { name: 'Invalid Resume Data' };
              }

              return (
                <div key={index} className="relative">
                  <MiniResumePreview resume={resume} data={data} />
                  <div className="mt-2 text-center">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {resume.title || 'Untitled Resume'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create New Resume Button */}
        {resumes.length > 0 && (
          <div className="text-center mt-12">
            <a 
              href="/editor"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResumes;
