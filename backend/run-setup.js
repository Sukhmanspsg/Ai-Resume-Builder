#!/usr/bin/env node

console.log('🔧 ResumePro - Database Setup');
console.log('=====================================');

// Import and run setup
const { setupDatabase } = require('./setup-database');

setupDatabase()
  .then(() => {
    console.log('\n✨ Setup complete! You can now:');
    console.log('1. Start the backend server: npm start');
    console.log('2. View templates in the admin panel');
    console.log('3. Use the new database-driven templates');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check that resume_builder database exists');
    console.log('3. Verify database credentials in backend/db.js');
    process.exit(1);
  }); 