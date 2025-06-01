import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [templates, setTemplates] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [activeTab, setActiveTab] = useState('templates'); // templates or feedback
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/feedback/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/feedback/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackStats(res.data[0]);
    } catch (err) {
      console.error('Error fetching feedback stats:', err);
    }
  };

  const handleAddTemplate = async () => {
    if (!name || !htmlCode) return alert('Name and HTML code are required!');
    try {
      await axios.post('/api/templates', {
        name,
        description,
        html_code: htmlCode
      });
      setName('');
      setDescription('');
      setHtmlCode('');
      fetchTemplates();
    } catch (err) {
      console.error('Failed to add template:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(`/api/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  useEffect(() => {
    fetchTemplates();
    if (activeTab === 'feedback') {
      fetchFeedback();
      fetchFeedbackStats();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-[#1a237e]">Admin Panel</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`${
                    activeTab === 'templates'
                      ? 'border-[#1a237e] text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Templates
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`${
                    activeTab === 'feedback'
                      ? 'border-[#1a237e] text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  User Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'templates' ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Template Management</h2>
            
            <div className="border p-4 rounded mb-6">
              <h3 className="font-semibold mb-4">Add New Template</h3>
              <div className="space-y-4">
                <input
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Template Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="Template Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <textarea
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-[#1a237e] focus:border-transparent"
                  placeholder="HTML Code"
                  value={htmlCode}
                  rows={6}
                  onChange={(e) => setHtmlCode(e.target.value)}
                />
                <button
                  className="bg-[#1a237e] text-white px-6 py-2 rounded hover:bg-[#1a237e]/90 transition-colors"
                  onClick={handleAddTemplate}
                >
                  Add Template
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Existing Templates</h3>
              <div className="space-y-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="border p-4 rounded flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{tpl.name}</h4>
                      <p className="text-gray-600 text-sm">{tpl.description}</p>
                    </div>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      onClick={() => handleDelete(tpl.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feedback Stats */}
            {feedbackStats && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Feedback Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#1a237e]">{feedbackStats.total_feedback}</div>
                    <div className="text-gray-600">Total Feedback</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {feedbackStats.average_rating ? parseFloat(feedbackStats.average_rating).toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{feedbackStats.five_star}</div>
                    <div className="text-gray-600">5-Star Reviews</div>
                  </div>
                </div>
                
                {/* Rating Distribution */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = feedbackStats[`${rating === 1 ? 'one' : rating === 2 ? 'two' : rating === 3 ? 'three' : rating === 4 ? 'four' : 'five'}_star`] || 0;
                      const percentage = feedbackStats.total_feedback > 0 ? (count / feedbackStats.total_feedback) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-yellow-400 rounded-full h-4 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm text-gray-600">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Recent Feedback</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a237e]"></div>
                  <span className="ml-3">Loading feedback...</span>
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No feedback received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {item.user_name || 'Anonymous User'}
                            </span>
                            {item.user_email && (
                              <span className="text-sm text-gray-500">({item.user_email})</span>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            {renderStars(item.rating)}
                            <span className="ml-2 text-sm text-gray-600">
                              {item.rating}/5 stars
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                      
                      {item.comment && (
                        <div className="bg-gray-50 p-3 rounded border-l-4 border-[#1a237e]">
                          <p className="text-gray-700 italic">"{item.comment}"</p>
                        </div>
                      )}
                      
                      {item.resume_title && (
                        <div className="mt-2 text-sm text-gray-600">
                          Related to resume: <span className="font-medium">{item.resume_title}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
