require('dotenv').config();
const express = require('express');
const pool = require('./db'); // Your MySQL connection pool
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ----------------- Middleware: Verify Admin JWT ----------------- */
function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/* ----------------- Admin Login ----------------- */
app.post('/api/login/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid username' });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Password Change from Admin Panel ----------------- */
app.put('/api/admin/change-password', verifyJWT, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
    if (!rows.length) return res.status(404).json({ message: 'Admin not found' });

    const admin = rows[0];
    const valid = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hashed, req.admin.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Password Change from Login Page (no JWT needed) ----------------- */
app.put('/api/admin/change-password-login', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (!rows.length) return res.status(404).json({ message: 'Admin not found' });

    const admin = rows[0];
    const valid = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password_hash = ? WHERE username = ?', [hashed, username]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error("Change Password Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Admin Panel APIs ----------------- */
// Get all students
app.get('/api/admin/students', verifyJWT, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error("Fetch Students Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teachers
app.get('/api/admin/teachers', verifyJWT, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error("Fetch Teachers Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Student Registration ----------------- */
app.post('/api/register/student', async (req, res) => {
  try {
    const { name, phone, className, schoolName, homeAddress, subjects, teacherSalary } = req.body;
    await pool.query('INSERT INTO students (name, phone, class, schoolName, homeAddress, subjects, teacherSalary) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, phone, className, schoolName, homeAddress, subjects, teacherSalary]);
    res.json({ message: 'Student registered successfully' });
  } catch (err) {
    console.error("Student Registration Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Teacher Registration ----------------- */
app.post('/api/register/teacher', async (req, res) => {
  try {
    const { name, email, subject, experience, phone, address, qualifications, classOfTeaching, workingSchool, preferredLocation } = req.body;
    await pool.query(
      'INSERT INTO teachers (name, email, subject, experience, phone, address, qualifications, classOfTeaching, workingSchool, preferredLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, subject, experience, phone, address, qualifications, classOfTeaching, workingSchool, preferredLocation]
    );
    res.json({ message: 'Teacher registered successfully' });
  } catch (err) {
    console.error("Teacher Registration Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Delete Student & Teacher ----------------- */
// Delete student
app.delete('/api/admin/student/delete/:id', verifyJWT, async (req, res) => {
  try {
    const studentId = req.params.id;
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [studentId]);
    if(result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error("Delete Student Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete teacher
app.delete('/api/admin/teacher/delete/:id', verifyJWT, async (req, res) => {
  try {
    const teacherId = req.params.id;
    const [result] = await pool.query('DELETE FROM teachers WHERE id = ?', [teacherId]);
    if(result.affectedRows === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error("Delete Teacher Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete contact message
app.delete('/api/admin/contact-message/delete/:id', verifyJWT, async (req, res) => {
  try {
    const messageId = req.params.id;
    const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [messageId]);
    if(result.affectedRows === 0) return res.status(404).json({ message: 'Contact message not found' });
    res.json({ message: 'Contact message deleted successfully' });
  } catch (err) {
    console.error("Delete Contact Message Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Contact Form ----------------- */
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    await pool.query('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    res.json({ message: 'Message received. Thank you!' });
  } catch (err) {
    console.error("Contact Form Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contact messages (admin only)
app.get('/api/admin/contact-messages', verifyJWT, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error("Fetch Contact Messages Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Server Start ----------------- */
app.listen(3000, () => console.log('✅ Server running on port 3000'));
