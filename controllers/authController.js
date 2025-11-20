const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, profile, studentId, employeeId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      profile
    });

    if (user) {
      // Create student profile if role is student
      if (role === 'student' && studentId) {
        await Student.create({
          user: user._id,
          studentId,
          rollNumber: studentId,
          department: profile.department,
          semester: profile.semester,
          batch: new Date().getFullYear(),
          admissionDate: new Date()
        });
      }

      // Create faculty profile if role is faculty
      if (role === 'faculty' && employeeId) {
        await Faculty.create({
          user: user._id,
          employeeId,
          department: profile.department,
          designation: 'Assistant Professor'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message || 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ 
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let additionalInfo = {};
    if (user.role === 'student') {
      additionalInfo = await Student.findOne({ user: user._id }).populate('academicRecord.courses.course');
    } else if (user.role === 'faculty') {
      additionalInfo = await Faculty.findOne({ user: user._id }).populate('courses');
    }

    res.json({
      user,
      additionalInfo
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(400).json({ message: 'Error fetching profile' });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.profile = { ...user.profile, ...req.body.profile };

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ message: 'Error updating profile' });
  }
};



const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(400).json({ message: 'Error fetching users' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers
};