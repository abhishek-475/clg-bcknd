const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  phone: String,
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['admission', 'general', 'complaint', 'suggestion', 'academic', 'other']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: 10
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);