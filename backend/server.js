require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tuition_db';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ==================== MONGOOSE MODELS ====================
// Admin Model
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

// Student Model
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true
  },
  subjects: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  schoolName: {
    type: String,
    trim: true
  },
  homeAddress: {
    type: String,
    trim: true
  },
  teacherSalary: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

// Teacher Model
const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  qualifications: {
    type: String,
    trim: true
  },
  classOfTeaching: {
    type: String,
    trim: true
  },
  workingSchool: {
    type: String,
    trim: true
  },
  preferredLocation: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

// Contact Message Model
const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// Assessment Model
const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  answers: [{
    question: String,
    answer: String
  }],
  score: {
    type: Number,
    min: 0,
    max: 100
  }
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'multiple-choice', 'true-false'],
      default: 'text'
    },
    options: [String], // For multiple choice
    correctAnswer: String // For auto-grading
  }],
  submissions: [submissionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }
}, {
  timestamps: true
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

// ==================== ADMIN SEEDING FUNCTION ====================
const seedAdmin = async () => {
  try {
    const username = 'admin';
    const password = 'admin123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      password_hash: hashedPassword
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    return true;
  } catch (err) {
    if (err.code === 11000) {
      console.log('ℹ️ Admin user already exists');
      return true;
    }
    console.error('❌ Error creating admin:', err.message);
    return false;
  }
};

// ==================== CONNECT TO DATABASE ====================
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

/* ----------------- Admin Seeding Route ----------------- */
app.post('/api/admin/seed', async (req, res) => {
  try {
    const success = await seedAdmin();
    if (success) {
      res.json({ message: 'Admin seeding completed successfully' });
    } else {
      res.status(500).json({ message: 'Admin seeding failed' });
    }
  } catch (err) {
    console.error("Admin Seeding Route Error:", err);
    res.status(500).json({ message: 'Server error during seeding' });
  }
});

/* ----------------- STATIC FILE SERVING & SPA ROUTING ----------------- */

// Serve static files from frontend directory
const path = require('path');
const frontendPath = path.join(__dirname, '../frontend');

// Serve static files (CSS, JS, images, etc.) FIRST
app.use(express.static(frontendPath));

// SPA fallback middleware - handle client-side routing for non-API routes
// This should come AFTER static file serving
app.use((req, res, next) => {
  // Skip API routes - let them be handled by specific route handlers
  if (req.path.startsWith('/api/')) {
    return next(); // Continue to API routes
  }

  // For all other routes, serve index.html to let client-side routing handle it
  res.sendFile(path.join(frontendPath, 'Html', 'index.html'));
});

/* ----------------- SERVER STARTUP ----------------- */

// Use dynamic port for Render deployment (Render provides PORT env var)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving frontend from: ${frontendPath}`);
  console.log(`🌐 Frontend URL: http://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api/...`);
});
