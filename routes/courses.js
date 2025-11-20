const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  addCourseResource
} = require('../controllers/courseController');
const { protect, faculty } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', protect, faculty, createCourse);
router.put('/:id', protect, faculty, updateCourse);
router.delete('/:id', protect, faculty, deleteCourse);
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/:id/resources', protect, faculty, addCourseResource);

module.exports = router;