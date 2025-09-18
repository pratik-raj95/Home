require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    // Create database if not exists
    await pool.query('CREATE DATABASE IF NOT EXISTS ??', [process.env.DB_NAME]);

    // Use the database
    await pool.query('USE ??', [process.env.DB_NAME]);

    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        class VARCHAR(50),
        area VARCHAR(255),
        subjects VARCHAR(255),
        phone VARCHAR(20),
        schoolName VARCHAR(255),
        homeAddress TEXT,
        teacherSalary DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create teachers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        subject VARCHAR(255),
        experience INT DEFAULT 0,
        area VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        qualifications VARCHAR(255),
        classOfTeaching VARCHAR(255),
        workingSchool VARCHAR(255),
        preferredLocation VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    process.exit(1);
  }
})();
