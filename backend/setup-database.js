const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'resume_builder',
  multipleStatements: true
};

// Create connection
const connection = mysql.createConnection(dbConfig);

async function runMigration(filePath) {
  try {
    console.log(`Running migration: ${filePath}`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    return new Promise((resolve, reject) => {
      connection.query(sql, (error, results) => {
        if (error) {
          console.error(`Error running ${filePath}:`, error);
          reject(error);
        } else {
          console.log(`✅ Successfully ran ${filePath}`);
          resolve(results);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Connect to database
    await new Promise((resolve, reject) => {
      connection.connect((error) => {
        if (error) {
          console.error('Error connecting to database:', error);
          reject(error);
        } else {
          console.log('✅ Connected to MySQL database');
          resolve();
        }
      });
    });

    // Run migrations in order
    const migrationFiles = [
      'migrations/create_templates_table.sql',
      'migrations/insert_default_templates.sql',
      'migrations/insert_additional_templates.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        await runMigration(filePath);
      } else {
        console.warn(`⚠️ Migration file not found: ${filePath}`);
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Templates have been added to the database');
    
  } catch (error) {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    connection.end();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 