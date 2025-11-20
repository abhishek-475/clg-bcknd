const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    required: true
  },
  guardian: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  academicRecord: [{
    semester: String,
    courses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      grade: String,
      credits: Number,
      points: Number
    }],
    sgpa: Number,
    cgpa: Number
  }],
  attendance: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    date: Date,
    status: {
      type: String,
      enum: ['present', 'absent', 'late']
    }
  }],
  fees: [{
    semester: String,
    amount: Number,
    paid: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['paid', 'partial', 'pending', 'overdue']
    },
    transactions: [{
      amount: Number,
      date: Date,
      method: String,
      transactionId: String
    }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);