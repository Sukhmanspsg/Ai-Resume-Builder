import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const FeedbackDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, statsRes] = await Promise.all([
          axios.get('/api/feedback/all'),
          axios.get('/api/feedback/stats')
        ]);

        setFeedback(feedbackRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError('Failed to fetch feedback data');
        console.error('Error fetching feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Total Feedback</h4>
          <p className="text-2xl font-bold">{stats?.total_feedback || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Average Rating</h4>
          <p className="text-2xl font-bold">
            {stats?.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
            <span className="text-yellow-400 ml-2">
              <FaStar className="inline" />
            </span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">5 Star Ratings</h4>
          <p className="text-2xl font-bold">{stats?.five_star || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Recent Feedback</h4>
          <p className="text-2xl font-bold">{feedback.length}</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Rating Distribution</h3>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats?.[`${star}_star`] || 0;
          const percentage = stats?.total_feedback 
            ? ((count / stats.total_feedback) * 100).toFixed(1) 
            : 0;

          return (
            <div key={star} className="flex items-center mb-2">
              <div className="w-12 text-sm">{star} stars</div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600">{percentage}%</div>
            </div>
          );
        })}
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold p-6 border-b">Recent Feedback</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.user_name || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">{item.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.resume_title || 'Untitled'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex text-yellow-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <FaStar key={i} className="w-4 h-4" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.comment || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard; 