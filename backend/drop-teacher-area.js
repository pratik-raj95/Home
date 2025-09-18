require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    await pool.query('USE ??', [process.env.DB_NAME]);

    // Drop area column if exists
    const [areaColumn] = await pool.query('SHOW COLUMNS FROM teachers LIKE "area"');
    if (areaColumn.length > 0) {
      await pool.query('ALTER TABLE teachers DROP COLUMN area');
      console.log('✅ Dropped area column from teachers table');
    } else {
      console.log('Area column does not exist in teachers table');
    }

    console.log('✅ Completed dropping area column from teachers table');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping area column:', err.message);
    process.exit(1);
  }
})();
