import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DefaultTemplate from '../components/DefaultTemplate';
import ModernTemplate from '../components/ModernTemplate';
import MinimalTemplate from '../components/MinimalTemplate';

const TemplateGallery = () => {
  const { state: resumeData } = useLocation();
  const navigate = useNavigate();

  const templates = [
    {
      id: 'default',
      name: 'Professional',
      component: DefaultTemplate,
      description: 'A classic, professional template perfect for traditional industries.'
    },
    {
      id: 'modern',
      name: 'Modern',
      component: ModernTemplate,
      description: 'A contemporary design with a gradient header and modern styling.'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      component: MinimalTemplate,
      description: 'A clean, minimalist design focusing on content and readability.'
    }
  ];

  const handleTemplateSelect = (templateId) => {
    navigate('/resume-preview', { 
      state: { 
        ...resumeData,
        selectedTemplate: templateId,
        selectedColor: '#1A237E', // Default color
        useDatabase: false // Use React components instead of database templates
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Resume Template</h1>
          <p className="text-gray-600">Select from our professionally designed templates to make your resume stand out.</p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {templates.map((template) => {
            const TemplateComponent = template.component;
            return (
              <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Template Preview */}
                <div className="h-[400px] overflow-y-auto p-4 border-b border-gray-200">
                  <div className="transform scale-[0.6] origin-top">
                    <TemplateComponent resume={resumeData} />
                  </div>
                </div>
                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <button
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full bg-[#1A237E] text-white py-2 px-4 rounded hover:bg-[#1A237E]/90 transition-colors"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/resume-preview', { 
              state: {
                ...resumeData,
                selectedTemplate: 1, // Default template ID
                selectedColor: '#1A237E', // Default color
                useDatabase: true // Use database templates
              }
            })}
            className="bg-gray-800 text-white py-2 px-6 rounded hover:bg-gray-700 transition-colors"
          >
            Back to Preview
          </button>
          <button
            onClick={() => navigate('/cover-letter', { state: resumeData })}
            className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition-colors"
          >
            Create Cover Letter
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery; 