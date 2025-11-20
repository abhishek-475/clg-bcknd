const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: Date,
  venue: {
    type: String,
    required: [true, 'Venue is required']
  },
  type: {
    type: String,
    enum: ['academic', 'cultural', 'sports', 'workshop', 'seminar', 'conference'],
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  image: String,
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  registrationDeadline: Date,
  tags: [String],
  requirements: [String],
  contactInfo: {
    name: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

// Index for querying events by date and type
eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ status: 1 });

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (this.registrationDeadline) {
    return new Date() <= this.registrationDeadline;
  }
  return true;
});

module.exports = mongoose.model('Event', eventSchema);