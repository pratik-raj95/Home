require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    // Use the database
    await pool.query('USE ??', [process.env.DB_NAME]);

    // Alter students table to add missing columns if not exist
    // Check if phone column exists
    const [studentPhoneColumns] = await pool.query('SHOW COLUMNS FROM students LIKE "phone"');
    if (studentPhoneColumns.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN phone VARCHAR(20) AFTER subjects');
      console.log('✅ Added phone column to students table');
    } else {
      console.log('Phone column already exists in students table');
    }

    // Check if schoolName column exists
    const [studentSchoolNameColumns] = await pool.query('SHOW COLUMNS FROM students LIKE "schoolName"');
    if (studentSchoolNameColumns.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN schoolName VARCHAR(255) AFTER phone');
      console.log('✅ Added schoolName column to students table');
    }

    // Check if homeAddress column exists
    const [studentHomeAddressColumns] = await pool.query('SHOW COLUMNS FROM students LIKE "homeAddress"');
    if (studentHomeAddressColumns.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN homeAddress TEXT AFTER schoolName');
      console.log('✅ Added homeAddress column to students table');
    }

    // Check if teacherSalary column exists
    const [studentTeacherSalaryColumns] = await pool.query('SHOW COLUMNS FROM students LIKE "teacherSalary"');
    if (studentTeacherSalaryColumns.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN teacherSalary DECIMAL(10,2) AFTER homeAddress');
      console.log('✅ Added teacherSalary column to students table');
    }

    // Alter teachers table to add missing columns if not exist
    // Check if phone column exists
    const [teacherPhoneColumns] = await pool.query('SHOW COLUMNS FROM teachers LIKE "phone"');
    if (teacherPhoneColumns.length === 0) {
      await pool.query('ALTER TABLE teachers ADD COLUMN phone VARCHAR(20) AFTER area');
      console.log('✅ Added phone column to teachers table');
    } else {
      console.log('Phone column already exists in teachers table');
    }

    // Check if address column exists
    const [teacherAddressColumns] = await pool.query('SHOW COLUMNS FROM teachers LIKE "address"');
    if (teacherAddressColumns.length === 0) {
      await pool.query('ALTER TABLE teachers ADD COLUMN address TEXT AFTER phone');
      console.log('✅ Added address column to teachers table');
    }

    // Check if qualifications column exists
    const [teacherQualificationsColumns] = await pool.query('SHOW COLUMNS FROM teachers LIKE "qualifications"');
    if (teacherQualificationsColumns.length === 0) {
      await pool.query('ALTER TABLE teachers ADD COLUMN qualifications VARCHAR(255) AFTER address');
      console.log('✅ Added qualifications column to teachers table');
    }

    // Check if classOfTeaching column exists
    const [teacherClassOfTeachingColumns] = await pool.query('SHOW COLUMNS FROM teachers LIKE "classOfTeaching"');
    if (teacherClassOfTeachingColumns.length === 0) {
      await pool.query('ALTER TABLE teachers ADD COLUMN classOfTeaching VARCHAR(255) AFTER qualifications');
      console.log('✅ Added classOfTeaching column to teachers table');
    }

    // Check if workingSchool column exists
    const [teacherWorkingSchoolColumns] = await pool.query('SHOW COLUMNS FROM teachers LIKE "workingSchool"');
    if (teacherWorkingSchoolColumns.length === 0) {
      await pool.query('ALTER TABLE teachers ADD COLUMN workingSchool VARCHAR(255) AFTER classOfTeaching');
      console.log('✅ Added workingSchool column to teachers table');
    }

    // Check if preferredLocation column exists
    const [teacherPreferredLocationColumns] = await pool.query('SHOW COLUMNS FROM teachers LIKE "preferredLocation"');
    if (teacherPreferredLocationColumns.length === 0) {
      await pool.query('ALTER TABLE teachers ADD COLUMN preferredLocation VARCHAR(255) AFTER workingSchool');
      console.log('✅ Added preferredLocation column to teachers table');
    }

    // Check other potential missing columns, but based on schema, phone was missing

    console.log('✅ Tables altered successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error altering tables:', err.message);
    process.exit(1);
  }
})();
