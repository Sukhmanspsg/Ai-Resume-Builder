import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import FeedbackForm from './FeedbackForm';

const ResumeDownload = () => {
  const { resumeId } = useParams();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleDownload = () => {
    // Your existing download logic here
    
    // Show feedback form after download
    setShowFeedback(true);
  };

  const handleFeedbackSuccess = () => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Download Your Resume</h2>
        
        {/* Your existing download buttons/options */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Download PDF
          </button>
          {/* Add other download format options if needed */}
        </div>

        {/* Show feedback form after download */}
        {showFeedback && !feedbackSubmitted && (
          <div className="mt-8">
            <FeedbackForm
              resumeId={resumeId}
              onSubmitSuccess={handleFeedbackSuccess}
            />
          </div>
        )}

        {/* Show thank you message after feedback submission */}
        {feedbackSubmitted && (
          <div className="mt-8 text-center p-4 bg-green-50 text-green-700 rounded-md">
            Thank you for your feedback! We appreciate your input.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDownload; 