require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

// database connection
const connectDB = require('./config/database');
connectDB();

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route - ADD THIS
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/events', require('./routes/events'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/students', require('./routes/students'));
app.use('/api/uploads', require('./routes/uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('', (req, res) => { // Changed from '' to '*'
  res.status(404).json({ message: 'Route not found' });
});

// FIXED PORT ASSIGNMENT
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});