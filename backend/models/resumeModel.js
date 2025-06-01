const db = require('../config/db');

// ===========================================
// CREATE A NEW RESUME
// ===========================================
exports.createResume = (user_id, template_id, title, content, callback) => {
  const sql = 'INSERT INTO resumes (user_id, template_id, title, content) VALUES (?, ?, ?, ?)';
  
  // Insert a new resume into the database for the given user and template
  db.query(sql, [user_id, template_id, title, content], callback);
};

// ===========================================
// GET ALL RESUMES FOR A SPECIFIC USER
// ===========================================
exports.getUserResumes = (userId, callback) => {
  const sql = 'SELECT * FROM resumes WHERE user_id = ?';

  // Fetch all resumes created by a specific user
  db.query(sql, [userId], callback);
};

// ===========================================
// GET A SPECIFIC RESUME BY ID
// ===========================================
exports.getResumeById = (id, callback) => {
  const sql = 'SELECT * FROM resumes WHERE id = ?';

  // Fetch one resume using its unique ID
  db.query(sql, [id], callback);
};

// ===========================================
// UPDATE AN EXISTING RESUME
// ===========================================
exports.updateResume = (id, template_id, title, content, callback) => {
  const sql = `
    UPDATE resumes 
    SET template_id = ?, title = ?, content = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  // Update resume title, template, and content; also updates the timestamp
  db.query(sql, [template_id, title, content, id], callback);
};

// ===========================================
// DELETE A RESUME
// ===========================================
exports.deleteResume = (id, callback) => {
  const sql = 'DELETE FROM resumes WHERE id = ?';

  // Permanently delete the resume with the given ID
  db.query(sql, [id], callback);
};
