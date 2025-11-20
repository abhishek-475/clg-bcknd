const express = require('express');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { protect, admin, faculty } = require('../middleware/auth');

const router = express.Router();

// Get student profile
router.get('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email profile')
      .populate('academicRecord.courses.course')
      .populate('attendance.course');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students (Admin/Faculty only)
router.get('/', protect, faculty, async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const students = await Student.find(filter)
      .populate('user', 'name email profile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rollNumber: 1 });

    const total = await Student.countDocuments(filter);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get('/:id', protect, faculty, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email profile')
      .populate('academicRecord.courses.course')
      .populate('attendance.course');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student academic record
router.post('/:id/academic', protect, faculty, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.academicRecord.push(req.body);
    await student.save();

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark attendance
router.post('/attendance', protect, faculty, async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.attendance.push({
      course: courseId,
      date: new Date(date),
      status
    });

    await student.save();
    res.json({ message: 'Attendance marked successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get student's enrolled courses
router.get('/:id/courses', protect, async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: req.params.id
    }).populate('faculty', 'name email');

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;