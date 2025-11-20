const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 'Mathematics', 'Physics', 'Chemistry']
  },
  designation: {
    type: String,
    required: true,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  specialization: [String],
  experience: {
    years: Number,
    description: String
  },
  researchInterests: [String],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    link: String
  }],
  officeHours: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  officeLocation: String,
  phoneExtension: String,
  socialLinks: {
    website: String,
    linkedin: String,
    googleScholar: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

facultySchema.virtual('courses', {
  ref: 'Course',
  localField: 'user',
  foreignField: 'faculty'
});

module.exports = mongoose.model('Faculty', facultySchema);