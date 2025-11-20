const express = require('express');
const Contact = require('../models/Contact');
const { protect, admin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Create contact message
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all contact messages (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name email')
      .populate('response.respondedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(filter);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update contact status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        assignedTo: req.body.assignedTo 
      },
      { new: true }
    );

    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add response to contact
router.post('/:id/response', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        response: {
          message: req.body.message,
          respondedBy: req.user._id,
          respondedAt: new Date()
        },
        status: 'resolved'
      },
      { new: true }
    ).populate('response.respondedBy', 'name email');

    // Send email response if configured
    if (process.env.EMAIL_HOST && contact.email) {
      await sendResponseEmail(contact.email, req.body.message, contact.subject);
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Email transporter (configure in .env)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResponseEmail = async (to, message, subject) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">EduTech College Response</h2>
          <p>Thank you for contacting us. Here is our response:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            ${message}
          </div>
          <p>Best regards,<br>EduTech College Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = router;