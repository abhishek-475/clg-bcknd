// routes/faculty.js - UPDATED VERSION
const express = require('express');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const { protect, faculty } = require('../middleware/auth');

const router = express.Router();

// Get all faculty - FIXED RESPONSE FORMAT
router.get('/', async (req, res) => {
  try {
    const facultyMembers = await Faculty.find({ isActive: true })
      .populate('user', 'name email profile avatar')
      .sort({ designation: 1 });

    res.json({
      success: true,
      data: facultyMembers,
      count: facultyMembers.length
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching faculty',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get faculty by ID - FIXED RESPONSE FORMAT
router.get('/:id', async (req, res) => {
  try {
    const facultyMember = await Faculty.findById(req.params.id)
      .populate('user', 'name email profile avatar')
      .populate({
        path: 'courses',
        model: 'Course'
      });

    if (!facultyMember) {
      return res.status(404).json({ 
        success: false,
        message: 'Faculty member not found' 
      });
    }

    // Get courses taught by this faculty
    const courses = await Course.find({ faculty: facultyMember.user });

    res.json({
      success: true,
      data: {
        ...facultyMember.toObject(),
        courses
      }
    });
  } catch (error) {
    console.error('Get faculty by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching faculty member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get faculty by department - FIXED RESPONSE FORMAT
router.get('/department/:department', async (req, res) => {
  try {
    const facultyMembers = await Faculty.find({ 
      department: req.params.department,
      isActive: true 
    }).populate('user', 'name email profile avatar');

    res.json({
      success: true,
      data: facultyMembers,
      count: facultyMembers.length
    });
  } catch (error) {
    console.error('Get faculty by department error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching faculty by department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update faculty profile - FIXED RESPONSE FORMAT
router.put('/:id', protect, faculty, async (req, res) => {
  try {
    const facultyMember = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email profile avatar');

    if (!facultyMember) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty profile updated successfully',
      data: facultyMember
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating faculty profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;