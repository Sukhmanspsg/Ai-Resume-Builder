// src/pages/Templates.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DefaultTemplate from '../components/DefaultTemplate';
import ModernTemplate from '../components/ModernTemplate';
import MinimalTemplate from '../components/MinimalTemplate';
import AITemplateGenerator from '../components/AITemplateGenerator';
import '../styles/ResumeTemplate.css';

const Templates = () => {
  const { state: resumeData } = useLocation();
  const navigate = useNavigate();
  const [selectedColors, setSelectedColors] = useState({
    default: '#1A237E',
    modern: '#1A237E',
    minimal: '#1A237E'
  });
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [templates, setTemplates] = useState([
    {
      id: 'default',
      name: 'Professional',
      component: DefaultTemplate,
      description: 'A classic, professional template perfect for traditional industries.',
      colors: [
        { bg: 'bg-gray-100', color: '#1A237E' },
        { bg: 'bg-[#1A237E]', color: '#1A237E' },
        { bg: 'bg-blue-700', color: '#1d4ed8' },
        { bg: 'bg-blue-400', color: '#60a5fa' },
        { bg: 'bg-teal-400', color: '#2dd4bf' }
      ]
    },
    {
      id: 'modern',
      name: 'Modern',
      component: ModernTemplate,
      description: 'A contemporary design with a gradient header and modern styling.',
      colors: [
        { bg: 'bg-gray-100', color: '#1A237E' },
        { bg: 'bg-pink-200', color: '#ec4899' },
        { bg: 'bg-blue-200', color: '#3b82f6' },
        { bg: 'bg-green-200', color: '#22c55e' },
        { bg: 'bg-yellow-200', color: '#eab308' }
      ]
    },
    {
      id: 'minimal',
      name: 'Minimal',
      component: MinimalTemplate,
      description: 'A clean, minimalist design focusing on content and readability.',
      colors: [
        { bg: 'bg-gray-200', color: '#1A237E' },
        { bg: 'bg-rose-200', color: '#e11d48' },
        { bg: 'bg-stone-200', color: '#78716c' },
        { bg: 'bg-neutral-200', color: '#525252' }
      ]
    }
  ]);

  const handleColorSelect = (templateId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [templateId]: color
    }));
  };

  const handleTemplateSelect = (templateId) => {
    navigate('/resume-preview', { 
      state: { 
        ...resumeData,
        selectedTemplate: templateId,
        selectedColor: selectedColors[templateId]
      } 
    });
  };

  const handleAITemplateGenerated = (template) => {
    try {
      // Add the generated template to the templates array
      const newTemplateId = `custom-${Date.now()}`;
      
      // Create a React component from the component code
      let CustomTemplate;
      try {
        console.log('Creating component from code:', template.component_code);
        
        // First, try to create a simple wrapper to catch syntax errors early
        let componentCode = template.component_code;
        
        // Basic syntax validation
        if (!componentCode.includes('React.createElement')) {
          throw new Error('Component code must use React.createElement syntax');
        }
        
        // Count parentheses to check for balance
        const openParens = (componentCode.match(/\(/g) || []).length;
        const closeParens = (componentCode.match(/\)/g) || []).length;
        console.log(`Parentheses check: ${openParens} open, ${closeParens} close`);
        
        // The AI generates arrow functions, so we need to handle them properly
        if (componentCode.includes('=>')) {
          // Handle arrow function format: ({ resume, primaryColor }) => React.createElement(...)
          try {
            CustomTemplate = new Function('React', `
              const componentFunction = ${componentCode};
              return componentFunction;
            `)(React);
          } catch (syntaxError) {
            console.error('Syntax error in component code:', syntaxError);
            throw new Error(`JavaScript syntax error: ${syntaxError.message}`);
          }
        } else {
          // Handle traditional function format (fallback)
          CustomTemplate = new Function('React', `
            ${componentCode}
            return ResumeTemplate;
          `)(React);
        }
        
        // Test the component with mock data
        const mockData = {
          name: 'Test Name',
          email: 'test@example.com',
          contact: '123-456-7890',
          skills: ['JavaScript', 'React'],
          workExperience: [{ 
            title: 'Developer', 
            company: 'Company',
            startDate: '2020',
            endDate: '2023',
            responsibilities: ['Developed features', 'Fixed bugs']
          }],
          education: [{ 
            degree: 'BS Computer Science', 
            university: 'University',
            year: '2020'
          }],
          summary: 'Test summary'
        };
        
        // Try to render with mock data to validate
        try {
          const testResult = CustomTemplate(mockData, '#1A237E');
          if (!testResult) {
            throw new Error('Component returned null or undefined');
          }
          console.log('✅ Component created and validated successfully');
        } catch (renderError) {
          console.error('Component render test failed:', renderError);
          throw new Error(`Component failed render test: ${renderError.message}`);
        }
        
      } catch (error) {
        console.error('Failed to create component:', error);
        console.error('Component code that failed:', template.component_code);
        throw new Error(`Failed to create React component: ${error.message}`);
      }

      const newTemplate = {
        id: newTemplateId,
        name: template.name || 'Custom AI Template',
        component: CustomTemplate,
        description: template.description || 'AI Generated Template',
        colors: [
          { bg: 'bg-gray-100', color: '#1A237E' },
          { bg: 'bg-pink-200', color: '#ec4899' },
          { bg: 'bg-blue-200', color: '#3b82f6' },
          { bg: 'bg-green-200', color: '#22c55e' },
          { bg: 'bg-yellow-200', color: '#eab308' }
        ]
      };

      setTemplates(prev => [...prev, newTemplate]);
      setSelectedColors(prev => ({
        ...prev,
        [newTemplateId]: '#1A237E'
      }));
      setShowAIGenerator(false);
      
      // Show success message
      alert(`✅ Custom template "${template.name}" created successfully!`);
      
    } catch (error) {
      console.error('Failed to create template component:', error);
      // Show more specific error message to user
      alert(`❌ Failed to create template: ${error.message}\n\nThis is usually due to complex AI-generated code. Please try a simpler prompt or try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Resume Template</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Select from our professionally designed templates or create your own with AI.</p>
          
          {/* AI Generator Button */}
          {/* TEMPORARILY HIDDEN - AI Template Generator Button
          <button
            onClick={() => setShowAIGenerator(true)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Create Custom Template with AI
          </button>
          */}
        </div>

        {/* AI Template Generator Modal */}
        {showAIGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-2xl w-full">
              <div className="relative">
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <AITemplateGenerator onTemplateGenerated={handleAITemplateGenerated} />
              </div>
            </div>
          </div>
        )}

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {templates.map((template) => {
            const TemplateComponent = template.component;
            return (
              <div key={template.id} className="group relative">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  {/* Template Preview Window */}
                  <div className="relative h-[680px] overflow-hidden">
                    {/* Color Palette */}
                    <div className="absolute top-4 right-4 flex space-x-2 z-10">
                      {template.colors.map((colorObj, index) => (
                        <button
                          key={index}
                          onClick={() => handleColorSelect(template.id, colorObj.color)}
                          className={`w-6 h-6 rounded-full ${colorObj.bg} cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            ${selectedColors[template.id] === colorObj.color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                          `}
                        />
                      ))}
                    </div>
                    
                    {/* Download Options */}
                    <div className="absolute top-4 left-4 flex space-x-2 z-10">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">PDF</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">DOCX</span>
                    </div>

                    {/* Template Preview with Scale Animation */}
                    <div className="absolute top-0 left-0 right-0 w-[150%] -ml-[25%] transition-transform duration-500 group-hover:scale-[0.7] scale-[0.65] origin-top">
                      <div className="px-4 pt-4 pb-8">
                        <TemplateComponent 
                          resume={resumeData} 
                          primaryColor={selectedColors[template.id]}
                        />
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
                  </div>

                  {/* Template Info */}
                  <div className="p-8 bg-white border-t border-gray-100">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{template.name}</h3>
                    <p className="text-gray-600 mb-6 min-h-[48px]">{template.description}</p>
                    <button
                      onClick={() => handleTemplateSelect(template.id)}
                      className="w-full bg-[#1A237E] text-white py-4 px-6 rounded-xl text-lg font-medium hover:bg-[#1A237E]/90 transition-all duration-300 hover:shadow-lg"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => navigate('/resume-preview', { state: resumeData })}
            className="bg-[#1e293b] text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-[#1e293b]/90 transition-all duration-300 hover:shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Preview
          </button>
          <button
            onClick={() => navigate('/cover-letter', { state: resumeData })}
            className="bg-[#4CAF50] text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-[#4CAF50]/90 transition-all duration-300 hover:shadow-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            Create Cover Letter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Templates;
