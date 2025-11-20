const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all courses with advanced filtering
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { 
      department, 
      semester, 
      faculty, 
      search,
      status = 'active',
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (department && department !== 'All') {
      filter.department = department;
    }
    
    if (semester) {
      filter.semester = semester;
    }
    
    if (faculty) {
      filter.faculty = faculty;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const courses = await Course.find(filter)
      .populate('faculty', 'name email profile avatar')
      .populate('enrolledStudents', 'name email profile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortConfig);

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    // Get department statistics
    const departmentStats = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalStudents: { $sum: { $size: '$enrolledStudents' } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        statistics: {
          totalCourses: total,
          departmentStats
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single course with detailed information
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email profile avatar phoneExtension officeHours')
      .populate('enrolledStudents', 'name email profile rollNumber')
      .populate('resources.uploadedBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get related courses
    const relatedCourses = await Course.find({
      department: course.department,
      _id: { $ne: course._id },
      isActive: true
    })
    .populate('faculty', 'name email')
    .limit(4);

    // Calculate enrollment percentage
    const enrollmentPercentage = Math.round((course.enrolledStudents.length / course.capacity) * 100);

    res.json({
      success: true,
      data: {
        course,
        relatedCourses,
        enrollmentStats: {
          enrolled: course.enrolledStudents.length,
          capacity: course.capacity,
          available: course.capacity - course.enrolledStudents.length,
          percentage: enrollmentPercentage
        }
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Faculty
const createCourse = async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      credits,
      department,
      semester,
      capacity,
      syllabus,
      schedule
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this code already exists'
      });
    }

    // Validate faculty exists and is actually a faculty member
    const facultyUser = await User.findById(req.user._id);
    if (!facultyUser || facultyUser.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members can create courses'
      });
    }

    const courseData = {
      title,
      code: code.toUpperCase(),
      description,
      credits: parseInt(credits),
      department,
      semester,
      faculty: req.user._id,
      capacity: capacity || 30,
      syllabus: syllabus || [],
      schedule: schedule || {}
    };

    const course = new Course(courseData);
    await course.save();

    // Populate the created course
    await course.populate('faculty', 'name email profile');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(400).json({ 
      success: false,
      message: 'Error creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Faculty
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course faculty or admin
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Prevent updating code if it already exists for another course
    if (req.body.code && req.body.code !== course.code) {
      const existingCourse = await Course.findOne({ 
        code: req.body.code.toUpperCase(),
        _id: { $ne: course._id }
      });
      
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this code already exists'
        });
      }
      req.body.code = req.body.code.toUpperCase();
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate('faculty', 'name email profile')
     .populate('enrolledStudents', 'name email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(400).json({ 
      success: false,
      message: 'Error updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Faculty
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course faculty or admin
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Check if course has enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with enrolled students. Please unenroll students first.'
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error deleting course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is active
    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Course is not active for enrollment'
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll in courses'
      });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check capacity
    if (course.enrolledStudents.length >= course.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Course is full. Cannot enroll at this time.'
      });
    }

    // Check if student meets prerequisites (you can extend this)
    const currentSemester = parseInt(req.user.profile?.semester);
    const courseSemester = parseInt(course.semester);
    
    if (currentSemester < courseSemester) {
      return res.status(400).json({
        success: false,
        message: `You must be in semester ${course.semester} or higher to enroll in this course`
      });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    // Populate the updated course
    await course.populate('faculty', 'name email');

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: course
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error enrolling in course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Unenroll from course
// @route   POST /api/courses/:id/unenroll
// @access  Private/Student
const unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Remove student from enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== req.user._id.toString()
    );

    await course.save();

    res.json({
      success: true,
      message: 'Successfully unenrolled from course',
      data: course
    });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error unenrolling from course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add course resource
// @route   POST /api/courses/:id/resources
// @access  Private/Faculty
const addCourseResource = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course faculty
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add resources to this course'
      });
    }

    const resource = {
      title: req.body.title,
      description: req.body.description,
      fileUrl: req.body.fileUrl,
      fileType: req.body.fileType,
      uploadedBy: req.user._id
    };

    course.resources.push(resource);
    await course.save();

    // Populate the resource uploader info
    await course.populate('resources.uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Resource added successfully',
      data: course.resources[course.resources.length - 1]
    });
  } catch (error) {
    console.error('Add resource error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error adding resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove course resource
// @route   DELETE /api/courses/:id/resources/:resourceId
// @access  Private/Faculty
const removeCourseResource = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course faculty
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove resources from this course'
      });
    }

    const resourceIndex = course.resources.findIndex(
      resource => resource._id.toString() === req.params.resourceId
    );

    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    course.resources.splice(resourceIndex, 1);
    await course.save();

    res.json({
      success: true,
      message: 'Resource removed successfully'
    });
  } catch (error) {
    console.error('Remove resource error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error removing resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get courses by faculty
// @route   GET /api/courses/faculty/:facultyId
// @access  Public
const getCoursesByFaculty = async (req, res) => {
  try {
    const courses = await Course.find({ 
      faculty: req.params.facultyId,
      isActive: true 
    })
    .populate('faculty', 'name email profile')
    .populate('enrolledStudents', 'name email')
    .sort({ semester: 1, createdAt: -1 });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get faculty courses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching faculty courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/student/enrolled
// @access  Private/Student
const getStudentEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: req.user._id,
      isActive: true
    })
    .populate('faculty', 'name email profile officeHours')
    .sort({ semester: 1 });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching enrolled courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle course active status
// @route   PATCH /api/courses/:id/status
// @access  Private/Faculty
const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course faculty or admin
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course status'
      });
    }

    course.isActive = !course.isActive;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      data: course
    });
  } catch (error) {
    console.error('Toggle course status error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating course status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/statistics/overview
// @access  Private/Admin
const getCourseStatistics = async (req, res) => {
  try {
    const statistics = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          totalEnrollments: {
            $sum: { $size: '$enrolledStudents' }
          },
          averageEnrollment: {
            $avg: { $size: '$enrolledStudents' }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalCourses: 1,
          activeCourses: 1,
          inactiveCourses: { $subtract: ['$totalCourses', '$activeCourses'] },
          totalEnrollments: 1,
          averageEnrollment: { $round: ['$averageEnrollment', 2] }
        }
      }
    ]);

    const departmentStats = await Course.aggregate([
      {
        $group: {
          _id: '$department',
          courseCount: { $sum: 1 },
          studentCount: { $sum: { $size: '$enrolledStudents' } },
          averageCapacity: { $avg: '$capacity' }
        }
      },
      {
        $project: {
          department: '$_id',
          courseCount: 1,
          studentCount: 1,
          averageCapacity: { $round: ['$averageCapacity', 2] },
          utilizationRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$studentCount', { $multiply: ['$courseCount', '$averageCapacity'] } ]},
                  100
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { courseCount: -1 } }
    ]);

    const semesterStats = await Course.aggregate([
      {
        $group: {
          _id: '$semester',
          courseCount: { $sum: 1 },
          studentCount: { $sum: { $size: '$enrolledStudents' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: statistics[0] || {},
        departmentStats,
        semesterStats
      }
    });
  } catch (error) {
    console.error('Get course statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching course statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  addCourseResource,
  removeCourseResource,
  getCoursesByFaculty,
  getStudentEnrolledCourses,
  toggleCourseStatus,
  getCourseStatistics
};