const mongoose = require('mongoose');

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

module.exports = mongoose.model('Student', studentSchema);
