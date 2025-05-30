const db = require('../config/db');

// ===========================================
// SAVE FEEDBACK ENTRY
// ===========================================
exports.saveFeedback = (user_id, resume_id, message, callback) => {
  const sql = 'INSERT INTO feedback (user_id, resume_id, message) VALUES (?, ?, ?)';
  
  // Store AI-generated feedback for a specific resume and user
  db.query(sql, [user_id, resume_id, message], callback);
};

// ===========================================
// GET MOST RECENT FEEDBACK FOR A RESUME
// ===========================================
exports.getLatestByResumeId = (resume_id, callback) => {
  const sql = 'SELECT * FROM feedback WHERE resume_id = ? ORDER BY id DESC LIMIT 1';

  // Fetch the latest feedback for a given resume (most recent first)
  db.query(sql, [resume_id], (err, result) => {
    if (err) return callback(err, null);
    if (result.length === 0) return callback(null, null); // No feedback found
    return callback(null, result[0]); // Return latest feedback row
  });
};
