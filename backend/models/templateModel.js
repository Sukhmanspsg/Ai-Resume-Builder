const db = require('../config/db');

// ===========================================
// FETCH ALL RESUME TEMPLATES
// ===========================================
exports.getAllTemplates = (callback) => {
  const sql = 'SELECT * FROM templates';

  // Retrieve all templates from the templates table
  db.query(sql, callback);
};

// ===========================================
// FETCH A TEMPLATE BY ITS ID
// ===========================================
exports.getTemplateById = (id, callback) => {
  const sql = 'SELECT * FROM templates WHERE id = ?';

  // Retrieve a single template by its ID
  db.query(sql, [id], callback);
};

// ===========================================
// CREATE A NEW TEMPLATE
// ===========================================
exports.createTemplate = (name, description, html_code, callback) => {
  const sql = 'INSERT INTO templates (name, description, html_code) VALUES (?, ?, ?)';

  // Insert a new template with name, description, and HTML code
  db.query(sql, [name, description, html_code], callback);
};

// ===========================================
// UPDATE AN EXISTING TEMPLATE
// ===========================================
exports.updateTemplate = (id, name, description, html_code, callback) => {
  const sql = `
    UPDATE templates 
    SET name = ?, description = ?, html_code = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  // Update the template fields and set updated_at to current timestamp
  db.query(sql, [name, description, html_code, id], callback);
};

// ===========================================
// DELETE A TEMPLATE
// ===========================================
exports.deleteTemplate = (id, callback) => {
  const sql = 'DELETE FROM templates WHERE id = ?';

  // Permanently delete the template by its ID
  db.query(sql, [id], callback);
};
