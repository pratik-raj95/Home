require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    await pool.query('USE ??', [process.env.DB_NAME || 'tuition_db']);
    console.log('Students table columns:');
    const [studentRows] = await pool.query('DESCRIBE students');
    studentRows.forEach(row => {
      console.log(`${row.Field}: ${row.Type}`);
    });
    console.log('\\nTeachers table columns:');
    const [teacherRows] = await pool.query('DESCRIBE teachers');
    teacherRows.forEach(row => {
      console.log(`${row.Field}: ${row.Type}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
