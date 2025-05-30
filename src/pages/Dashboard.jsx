import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Simulated logged-in user object (for demo/testing purposes)
// In a real application, this should come from authentication context or API
const user = {
  name: 'Sukhmanpreet Singh',
  email: 'Sukhman29spsg@gmail.com' // This is considered the admin email
};

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-[#1a237e]">AI Resume Builder</h1>
              </div>
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-[#1a237e] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/MyResumes"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  View Resume
                </Link>
                <Link
                  to="/templates"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Manage Templates
                </Link>
                <Link
                  to="/resume-options"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Create Resume
                </Link>
                {/* Admin Link - You might want to conditionally render this based on user role */}
                <Link
                  to="/admin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a237e] hover:bg-[#1a237e]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a237e]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="bg-[#1a237e] text-white block pl-3 pr-4 py-2 text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/MyResumes"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 text-base font-medium"
            >
              View Resume
            </Link>
            <Link
              to="/templates"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Manage Templates
            </Link>
            <Link
              to="/resume-options"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Create Resume
            </Link>
            <Link
              to="/admin"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 text-base font-medium"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI Resume Builder</h2>
            <p className="text-gray-600 mb-6">
              Create professional resumes quickly and easily with our AI-powered platform.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-[#1a237e] transition-colors">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Resume</h3>
                <p className="text-gray-600 mb-4">Start building your professional resume with our AI assistance.</p>
                <Link
                  to="/resume-options"
                  className="text-[#1a237e] hover:text-[#1a237e]/90 font-medium"
                >
                  Get Started →
                </Link>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-[#1a237e] transition-colors">
                <h3 className="text-lg font-medium text-gray-900 mb-2">View Resumes</h3>
                <p className="text-gray-600 mb-4">Access and manage your existing resumes.</p>
                <Link
                  to="/MyResumes"
                  className="text-[#1a237e] hover:text-[#1a237e]/90 font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-[#1a237e] transition-colors">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Templates</h3>
                <p className="text-gray-600 mb-4">Browse and manage resume templates.</p>
                <Link
                  to="/templates"
                  className="text-[#1a237e] hover:text-[#1a237e]/90 font-medium"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
