const db = require('../config/db');

exports.createResume = (user_id, template_id, title, content, callback) => {
    const sql = 'INSERT INTO resumes (user_id, template_id, title, content) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, template_id, title, content], callback);
  };
  

exports.getUserResumes = (userId, callback) => {
  const sql = 'SELECT * FROM resumes WHERE user_id = ?';
  db.query(sql, [userId], callback);
};

exports.getResumeById = (id, callback) => {
  const sql = 'SELECT * FROM resumes WHERE id = ?';
  db.query(sql, [id], callback);
};

exports.updateResume = (id, template_id, title, content, callback) => {
    const sql = `
      UPDATE resumes 
      SET template_id = ?, title = ?, content = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    db.query(sql, [template_id, title, content, id], callback);
  };
  

exports.deleteResume = (id, callback) => {
  const sql = 'DELETE FROM resumes WHERE id = ?';
  db.query(sql, [id], callback);
};
