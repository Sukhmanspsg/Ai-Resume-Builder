const db = require('../config/db');

class FeedbackModel {
  static createFeedback(userId, resumeId, rating, comment, callback) {
    const query = 'INSERT INTO feedback (user_id, resume_id, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(query, [userId, resumeId, rating, comment], callback);
  }

  static getAllFeedback(callback) {
    const query = `
      SELECT 
        f.*,
        u.name as user_name,
        u.email as user_email,
        r.title as resume_title
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN resumes r ON f.resume_id = r.id
      ORDER BY f.created_at DESC
    `;
    db.query(query, callback);
  }

  static getFeedbackByResumeId(resumeId, callback) {
    const query = `
      SELECT 
        f.*,
        u.name as user_name
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.resume_id = ?
      ORDER BY f.created_at DESC
    `;
    db.query(query, [resumeId], callback);
  }

  static getFeedbackStats(callback) {
    const query = `
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM feedback
    `;
    db.query(query, callback);
  }
}

module.exports = FeedbackModel;
