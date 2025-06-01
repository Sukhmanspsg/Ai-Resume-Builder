import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

const FeedbackForm = ({ resumeId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/api/feedback/submit', {
        resumeId,
        rating,
        comment,
        userId: localStorage.getItem('userId') // Assuming you store userId in localStorage
      });

      if (response.data) {
        setRating(0);
        setComment('');
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Rate your experience</h3>
      
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={`text-2xl mr-1 focus:outline-none ${
              (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <FaStar />
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-2 border rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows="3"
        placeholder="Share your thoughts about the resume builder..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      <button
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
};

export default FeedbackForm; 