import React, { useState } from 'react';
import { FaUsers, FaFileAlt, FaChartBar, FaComments } from 'react-icons/fa';
import UserManagement from './UserManagement';
import TemplateManagement from './TemplateManagement';
import Analytics from './Analytics';
import FeedbackDashboard from './FeedbackDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'templates', label: 'Templates', icon: FaFileAlt },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'feedback', label: 'Feedback', icon: FaComments }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'templates':
        return <TemplateManagement />;
      case 'analytics':
        return <Analytics />;
      case 'feedback':
        return <FeedbackDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center px-6 py-3 text-left ${
                activeTab === tab.id
                  ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 