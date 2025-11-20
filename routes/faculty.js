const express = require('express');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const { protect, faculty } = require('../middleware/auth');

const router = express.Router();

// Get all faculty
router.get('/', async (req, res) => {
  try {
    const facultyMembers = await Faculty.find({ isActive: true })
      .populate('user', 'name email profile')
      .sort({ designation: 1 });

    res.json(facultyMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const facultyMember = await Faculty.findById(req.params.id)
      .populate('user', 'name email profile')
      .populate('courses');

    if (!facultyMember) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    // Get courses taught by this faculty
    const courses = await Course.find({ faculty: facultyMember.user });

    res.json({
      ...facultyMember.toObject(),
      courses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update faculty profile
router.put('/:id', protect, faculty, async (req, res) => {
  try {
    const facultyMember = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email profile');

    res.json(facultyMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get faculty by department
router.get('/department/:department', async (req, res) => {
  try {
    const facultyMembers = await Faculty.find({ 
      department: req.params.department,
      isActive: true 
    }).populate('user', 'name email profile');

    res.json(facultyMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;