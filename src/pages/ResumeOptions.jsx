// src/pages/ResumeOptions.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ResumeOptions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Your Resume</h1>
          <p className="text-lg text-gray-600">Choose how you want to begin creating your professional resume</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Upload Existing Resume Card */}
          <Link 
            to="/upload-resume"
            className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-8">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="flex items-center justify-center bg-[#1a237e]/5 rounded-lg h-48">
                  <svg 
                    className="w-20 h-20 text-[#1a237e] group-hover:scale-110 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Upload Existing Resume</h2>
              <p className="text-gray-600">
                Already have a resume? Upload it and our AI will help you enhance it.
              </p>
              <div className="mt-4 flex items-center text-[#1a237e] group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium">Get Started</span>
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* Create from Scratch Card */}
          <Link 
            to="/editor"
            className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-8">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="flex items-center justify-center bg-[#1a237e]/5 rounded-lg h-48">
                  <svg 
                    className="w-20 h-20 text-[#1a237e] group-hover:scale-110 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Resume from Scratch</h2>
              <p className="text-gray-600">
                Start fresh with our guided resume builder and AI assistance.
              </p>
              <div className="mt-4 flex items-center text-[#1a237e] group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-medium">Get Started</span>
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResumeOptions;
