const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Event = require('./models/Event');
const Faculty = require('./models/Faculty');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB || '');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Event.deleteMany({});
    await Faculty.deleteMany({});

    // Create sample users
    const studentUser = await User.create({
      name: 'John Student',
      email: 'student@edutech.edu',
      password: 'password123',
      role: 'student',
      profile: {
        phone: '+1234567890',
        department: 'Computer Science',
        semester: '3',
        address: {
          street: '123 Student St',
          city: 'Education City',
          state: 'EC',
          zipCode: '12345'
        }
      }
    });

    const facultyUser = await User.create({
      name: 'Dr. Sarah Professor',
      email: 'faculty@edutech.edu',
      password: 'password123',
      role: 'faculty',
      profile: {
        phone: '+1234567891',
        department: 'Computer Science',
        address: {
          street: '456 Faculty Ave',
          city: 'Education City',
          state: 'EC',
          zipCode: '12345'
        }
      }
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@edutech.edu',
      password: 'password123',
      role: 'admin',
      profile: {
        phone: '+1234567892',
        department: 'Administration'
      }
    });

    // Create faculty profile
    const facultyProfile = await Faculty.create({
      user: facultyUser._id,
      employeeId: 'FAC001',
      department: 'Computer Science',
      designation: 'Professor',
      qualifications: [
        {
          degree: 'PhD in Computer Science',
          institution: 'Tech University',
          year: 2015
        },
        {
          degree: 'MSc in Software Engineering',
          institution: 'Engineering College',
          year: 2010
        }
      ],
      specialization: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
      experience: {
        years: 12,
        description: 'Extensive experience in AI research and teaching'
      },
      researchInterests: ['Deep Learning', 'Natural Language Processing', 'Computer Vision'],
      publications: [
        {
          title: 'Advanced Machine Learning Techniques',
          journal: 'International Journal of AI',
          year: 2023,
          link: 'https://example.com/publication1'
        }
      ],
      officeHours: [
        {
          day: 'Monday',
          startTime: '10:00',
          endTime: '12:00'
        },
        {
          day: 'Wednesday',
          startTime: '14:00',
          endTime: '16:00'
        }
      ],
      officeLocation: 'CS Building Room 301',
      phoneExtension: '4567'
    });

    // Create sample courses
    const courses = await Course.create([
      {
        title: 'Introduction to Programming',
        code: 'CS101',
        description: 'Fundamental concepts of programming and problem solving using Python.',
        credits: 3,
        department: 'Computer Science',
        semester: '1',
        faculty: facultyUser._id,
        capacity: 30,
        syllabus: [
          {
            topic: 'Programming Basics',
            duration: '3 weeks',
            objectives: ['Understand basic syntax', 'Learn control structures', 'Write simple programs']
          },
          {
            topic: 'Data Structures',
            duration: '4 weeks',
            objectives: ['Learn arrays and lists', 'Understand dictionaries', 'Implement basic algorithms']
          }
        ],
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '09:00-10:00',
          classroom: 'CS-101'
        }
      },
      {
        title: 'Web Development',
        code: 'CS201',
        description: 'Comprehensive course on modern web development technologies including HTML, CSS, and JavaScript.',
        credits: 4,
        department: 'Computer Science',
        semester: '2',
        faculty: facultyUser._id,
        capacity: 25,
        syllabus: [
          {
            topic: 'HTML & CSS',
            duration: '3 weeks',
            objectives: ['Create semantic HTML', 'Style with CSS', 'Responsive design']
          },
          {
            topic: 'JavaScript Fundamentals',
            duration: '4 weeks',
            objectives: ['DOM manipulation', 'Event handling', 'Async programming']
          }
        ],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '14:00-16:00',
          classroom: 'CS-201'
        }
      },
      {
        title: 'Data Structures and Algorithms',
        code: 'CS301',
        description: 'Advanced course covering fundamental data structures and algorithm design techniques.',
        credits: 4,
        department: 'Computer Science',
        semester: '3',
        faculty: facultyUser._id,
        capacity: 20,
        syllabus: [
          {
            topic: 'Basic Data Structures',
            duration: '4 weeks',
            objectives: ['Arrays and Linked Lists', 'Stacks and Queues', 'Hash Tables']
          }
        ],
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: '11:00-13:00',
          classroom: 'CS-301'
        }
      }
    ]);

    // Create sample events
    const events = await Event.create([
      {
        title: 'Annual Tech Symposium',
        description: 'Join us for our annual technology symposium featuring talks from industry experts and student project demonstrations.',
        date: new Date('2024-03-15T09:00:00'),
        endDate: new Date('2024-03-15T17:00:00'),
        venue: 'Main Auditorium',
        type: 'conference',
        organizer: 'Computer Science Department',
        maxParticipants: 200,
        registrationDeadline: new Date('2024-03-10T23:59:59'),
        tags: ['technology', 'innovation', 'networking'],
        requirements: ['Registration required', 'College ID mandatory'],
        contactInfo: {
          name: 'Tech Events Committee',
          email: 'tech-events@edutech.edu',
          phone: '+1234567893'
        }
      },
      {
        title: 'Web Development Workshop',
        description: 'Hands-on workshop covering modern web development tools and frameworks.',
        date: new Date('2024-02-20T14:00:00'),
        venue: 'Computer Lab 2',
        type: 'workshop',
        organizer: 'CS Student Club',
        maxParticipants: 30,
        registrationDeadline: new Date('2024-02-18T23:59:59'),
        tags: ['web development', 'hands-on', 'beginner-friendly'],
        contactInfo: {
          name: 'Student Club President',
          email: 'club@edutech.edu'
        }
      },
      {
        title: 'Cultural Fest 2024',
        description: 'Annual cultural festival showcasing diverse talents and traditions from around the world.',
        date: new Date('2024-04-05T10:00:00'),
        endDate: new Date('2024-04-07T22:00:00'),
        venue: 'College Grounds',
        type: 'cultural',
        organizer: 'Cultural Committee',
        maxParticipants: 500,
        tags: ['culture', 'festival', 'entertainment'],
        contactInfo: {
          name: 'Cultural Committee',
          email: 'cultural@edutech.edu'
        }
      }
    ]);

    console.log('Sample data created successfully!');
    console.log('Student login: student@edutech.edu / password123');
    console.log('Faculty login: faculty@edutech.edu / password123');
    console.log('Admin login: admin@edutech.edu / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();