import React from 'react';

const ViewResume = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Resumes</h1>
        
        {/* Resume List */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="grid gap-6 p-6">
            {/* Sample Resume Card - This will be mapped over actual resume data */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#1a237e] transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Software Developer Resume</h3>
                  <p className="text-gray-600 mt-1">Last modified: March 15, 2024</p>
                </div>
                <div className="flex space-x-3">
                  <button className="text-[#1a237e] hover:text-[#1a237e]/90">
                    Edit
                  </button>
                  <button className="text-[#1a237e] hover:text-[#1a237e]/90">
                    Download
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Another Sample Resume Card */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#1a237e] transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Project Manager Resume</h3>
                  <p className="text-gray-600 mt-1">Last modified: March 10, 2024</p>
                </div>
                <div className="flex space-x-3">
                  <button className="text-[#1a237e] hover:text-[#1a237e]/90">
                    Edit
                  </button>
                  <button className="text-[#1a237e] hover:text-[#1a237e]/90">
                    Download
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResume; 