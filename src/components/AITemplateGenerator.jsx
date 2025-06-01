import React, { useState } from 'react';

const AITemplateGenerator = ({ onTemplateGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const examplePrompts = [
    "Create a modern template with a gradient header and minimalist design",
    "Design a creative template with a sidebar for skills and contact info",
    "Make a traditional template with a conservative layout and clear sections",
    "Generate a tech-focused template with a unique header and modern typography"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please describe how you want your template to look');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      console.log('Sending prompt to AI:', prompt);
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPrompt: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Generated Template:', data);
      
      if (!data.template) {
        throw new Error('Invalid response format from server');
      }
      
      // Validate template data
      if (!data.template.component_code) {
        throw new Error('Generated template is missing component code');
      }
      
      console.log('✅ Template generated successfully, calling parent handler');
      onTemplateGenerated(data.template);
      setPrompt('');
      
    } catch (error) {
      console.error('Template generation error:', error);
      setError(`Failed to generate template: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Template Generator</h2>
      <p className="text-gray-600 mb-6">
        Describe how you want your resume template to look, and our AI will create a custom design for you.
      </p>

      {/* Example Prompts */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Example Prompts:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.map((examplePrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(examplePrompt)}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
            >
              {examplePrompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Describe Your Dream Template
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., I want a modern template with a dark header, two columns layout, and my skills displayed in a sidebar..."
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isGenerating}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium flex items-center justify-center space-x-2
            ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1A237E] hover:bg-[#1A237E]/90'}`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating Template...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              <span>Generate Template</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AITemplateGenerator; 