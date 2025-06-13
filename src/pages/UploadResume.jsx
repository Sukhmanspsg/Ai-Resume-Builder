import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setMessage('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExt)) {
      setMessage('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    setIsUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      console.log('📤 Uploading file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      });

      const structuredData = res.data;
      console.log('📄 Received structured data:', structuredData);
      
      // Check if there was a parsing warning
      if (structuredData.parsingWarning) {
        console.warn('⚠️ Parsing warning:', structuredData.parsingWarning);
        setMessage(`Upload successful, but ${structuredData.parsingWarning}`);
      } else {
        setMessage('Resume uploaded and parsed successfully!');
      }
      
      // Store the structured data and navigate to editor
      localStorage.setItem('uploadedResume', JSON.stringify(structuredData));
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/editor', { 
          state: {
            ...structuredData,
            isUploadedResume: true // Flag to indicate this is from upload
          }
        });
      }, 1500);

    } catch (err) {
      console.error('❌ Upload error:', err);
      
      let errorMessage = 'Failed to upload or process your resume. ';
      
      if (err.response) {
        // Server responded with error
        const serverMessage = err.response.data?.message || 'Unknown server error';
        
        if (err.response.status === 413) {
          errorMessage = 'File is too large. Please upload a smaller file (max 10MB).';
        } else if (err.response.status === 400) {
          errorMessage = serverMessage;
        } else if (err.response.status === 500) {
          errorMessage = serverMessage;
        } else {
          errorMessage += serverMessage;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please try again with a smaller file.';
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      setMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage(''); // Clear any previous messages
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-[#1a237e] rounded-lg flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-gray-600">
            Upload your existing resume and we'll automatically extract and organize your information
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Choose Resume File
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                <label
                  htmlFor="resume-upload"
                  className={`relative block w-full border-2 border-dashed rounded-xl p-6 text-center hover:border-[#1a237e] focus:outline-none focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] transition-all cursor-pointer ${
                    file ? 'border-[#1a237e] bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-2">
                    {file ? (
                      <>
                        <svg className="mx-auto h-12 w-12 text-[#1a237e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-[#1a237e] font-medium">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-[#1a237e]">Click to upload</span> or drag and drop
                        </div>
                        <div className="text-xs text-gray-500">
                          PDF, DOC, or DOCX (up to 10MB)
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* File type information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Supported formats:</p>
                    <ul className="text-xs space-y-1">
                      <li>• PDF documents (.pdf)</li>
                      <li>• Microsoft Word (.doc, .docx)</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || isUploading}
              className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a237e] ${
                !file || isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#1a237e] hover:bg-[#1a237e]/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Resume...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Extract & Continue</span>
                </>
              )}
            </button>

            {/* Alternative Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a237e] transition-all"
            >
              Start from Scratch
            </button>
          </form>

          {/* Error/Success Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes('Failed') 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.includes('Failed') ? (
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <p className={`text-sm ${
                  message.includes('Failed') ? 'text-red-800' : 'text-green-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Smart AI Parsing</p>
              <p className="text-xs">Automatically extracts and organizes your experience, education, and skills</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Professional Templates</p>
              <p className="text-xs">Your information will be formatted into beautiful, ATS-friendly templates</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Instant Editing</p>
              <p className="text-xs">Review and customize your extracted information before generating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
