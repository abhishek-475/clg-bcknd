require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')






// database connection
const connectDB = require('./config/database');
connectDB();

const app =express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));






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
app.use('', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});



const PORT = 5000 || process.env.PORT


app.listen( PORT,() =>{
    console.log(`server is running on port: ${PORT}`);
})