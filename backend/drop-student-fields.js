require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    // Use the database
    await pool.query('USE ??', [process.env.DB_NAME]);

    // Check if email column exists in students table and drop it
    const [emailColumns] = await pool.query('SHOW COLUMNS FROM students LIKE "email"');
    if (emailColumns.length > 0) {
      await pool.query('ALTER TABLE students DROP COLUMN email');
      console.log('✅ Dropped email column from students table');
    } else {
      console.log('Email column does not exist in students table');
    }

    // Check if area column exists in students table and drop it
    const [areaColumns] = await pool.query('SHOW COLUMNS FROM students LIKE "area"');
    if (areaColumns.length > 0) {
      await pool.query('ALTER TABLE students DROP COLUMN area');
      console.log('✅ Dropped area column from students table');
    } else {
      console.log('Area column does not exist in students table');
    }

    console.log('✅ Student fields dropped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping student fields:', err.message);
    process.exit(1);
  }
})();
