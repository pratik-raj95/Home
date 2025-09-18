require('dotenv').config();
const express = require('express');
const connectDB = require('./db'); // MongoDB connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Import Mongoose models
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');
const ContactMessage = require('./models/ContactMessage');
const Assessment = require('./models/Assessment');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

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
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid username' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Password Change from Login Page (no JWT needed) ----------------- */
app.put('/api/admin/change-password-login', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const valid = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password_hash = hashed;
    await admin.save();

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
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Fetch Students Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teachers
app.get('/api/admin/teachers', verifyJWT, async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    console.error("Fetch Teachers Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Student Registration ----------------- */
app.post('/api/register/student', async (req, res) => {
  try {
    const { name, phone, className, schoolName, homeAddress, subjects, teacherSalary } = req.body;
    const student = new Student({
      name,
      phone,
      class: className,
      schoolName,
      homeAddress,
      subjects,
      teacherSalary
    });
    await student.save();
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
    const teacher = new Teacher({
      name,
      email,
      subject,
      experience,
      phone,
      address,
      qualifications,
      classOfTeaching,
      workingSchool,
      preferredLocation
    });
    await teacher.save();
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
    const result = await Student.findByIdAndDelete(studentId);
    if (!result) return res.status(404).json({ message: 'Student not found' });
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
    const result = await Teacher.findByIdAndDelete(teacherId);
    if (!result) return res.status(404).json({ message: 'Teacher not found' });
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
    const result = await ContactMessage.findByIdAndDelete(messageId);
    if (!result) return res.status(404).json({ message: 'Contact message not found' });
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
    const contactMessage = new ContactMessage({
      name,
      email,
      message
    });
    await contactMessage.save();
    res.json({ message: 'Message received. Thank you!' });
  } catch (err) {
    console.error("Contact Form Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contact messages (admin only)
app.get('/api/admin/contact-messages', verifyJWT, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch Contact Messages Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Assessment Routes ----------------- */
// Get all assessments (for teachers)
app.get('/api/assessments', verifyJWT, async (req, res) => {
  try {
    const assessments = await Assessment.find({ createdBy: req.admin.id }).sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    console.error("Fetch Assessments Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new assessment
app.post('/api/assessments', verifyJWT, async (req, res) => {
  try {
    const { title, description, class: className, subject, dueDate, questions } = req.body;
    const assessment = new Assessment({
      title,
      description,
      class: className,
      subject,
      dueDate,
      questions,
      createdBy: req.admin.id
    });
    await assessment.save();
    res.status(201).json({ message: 'Assessment created successfully', assessment });
  } catch (err) {
    console.error("Create Assessment Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assessment
app.put('/api/assessments/:id', verifyJWT, async (req, res) => {
  try {
    const { title, description, class: className, subject, dueDate, questions } = req.body;
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.admin.id },
      { title, description, class: className, subject, dueDate, questions },
      { new: true }
    );
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json({ message: 'Assessment updated successfully', assessment });
  } catch (err) {
    console.error("Update Assessment Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assessment
app.delete('/api/assessments/:id', verifyJWT, async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, createdBy: req.admin.id });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json({ message: 'Assessment deleted successfully' });
  } catch (err) {
    console.error("Delete Assessment Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assessments for students (by class)
app.get('/api/assessments/student', async (req, res) => {
  try {
    const { class: className } = req.query;
    if (!className) return res.status(400).json({ message: 'Class parameter required' });

    const assessments = await Assessment.find({ class: className }).sort({ dueDate: 1 });
    res.json(assessments);
  } catch (err) {
    console.error("Fetch Student Assessments Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assessment
app.post('/api/assessments/:id/submit', async (req, res) => {
  try {
    const { studentId, answers } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    // Check if student already submitted
    const existingSubmission = assessment.submissions.find(sub => sub.studentId.toString() === studentId);
    if (existingSubmission) {
      return res.status(400).json({ message: 'Assessment already submitted' });
    }

    // Add submission
    assessment.submissions.push({
      studentId,
      answers,
      submittedAt: new Date()
    });

    await assessment.save();
    res.json({ message: 'Assessment submitted successfully' });
  } catch (err) {
    console.error("Submit Assessment Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ----------------- Server Start ----------------- */
app.listen(3000, () => console.log('✅ Server running on port 3000'));
