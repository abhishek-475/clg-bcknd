const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Event = require('./models/Event');
const Faculty = require('./models/Faculty');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_db');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Event.deleteMany({});
    await Faculty.deleteMany({});

    // ----- Create Admin -----
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@edutech.edu',
      password: 'password123',
      role: 'admin',
      profile: { 
        phone: '+1234567890',
        department: 'Administration',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    });

    // ----- Create Detailed Faculty -----
    const facultyData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@edutech.edu',
        department: 'Computer Science',
        employeeId: 'CS101',
        designation: 'Professor',
        qualifications: [
          { degree: 'Ph.D. in Computer Science', institution: 'Stanford University', year: 2010 },
          { degree: 'M.S. in AI', institution: 'MIT', year: 2006 }
        ],
        specialization: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
        experience: { years: 14, description: 'Expert in AI research and industry applications' },
        researchInterests: ['Deep Learning', 'Computer Vision', 'Natural Language Processing'],
        officeHours: [
          { day: 'Monday', startTime: '10:00 AM', endTime: '12:00 PM' },
          { day: 'Wednesday', startTime: '2:00 PM', endTime: '4:00 PM' }
        ],
        officeLocation: 'CS Building, Room 301',
        phoneExtension: '2301',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          googleScholar: 'https://scholar.google.com/sarahjohnson'
        }
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@edutech.edu',
        department: 'Computer Science',
        employeeId: 'CS102',
        designation: 'Associate Professor',
        qualifications: [
          { degree: 'Ph.D. in Software Engineering', institution: 'Carnegie Mellon', year: 2015 }
        ],
        specialization: ['Software Engineering', 'Cloud Computing', 'DevOps'],
        experience: { years: 9, description: 'Industry experience in enterprise software development' },
        researchInterests: ['Microservices', 'Containerization', 'CI/CD'],
        officeHours: [
          { day: 'Tuesday', startTime: '9:00 AM', endTime: '11:00 AM' },
          { day: 'Thursday', startTime: '3:00 PM', endTime: '5:00 PM' }
        ],
        officeLocation: 'CS Building, Room 205',
        phoneExtension: '2302'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@edutech.edu',
        department: 'Mathematics',
        employeeId: 'MATH201',
        designation: 'Professor',
        qualifications: [
          { degree: 'Ph.D. in Applied Mathematics', institution: 'Cambridge University', year: 2008 }
        ],
        specialization: ['Calculus', 'Linear Algebra', 'Differential Equations'],
        experience: { years: 16, description: 'Research in mathematical modeling and applications' },
        researchInterests: ['Mathematical Biology', 'Optimization', 'Numerical Analysis'],
        officeHours: [
          { day: 'Monday', startTime: '1:00 PM', endTime: '3:00 PM' },
          { day: 'Friday', startTime: '10:00 AM', endTime: '12:00 PM' }
        ],
        officeLocation: 'Math Building, Room 101',
        phoneExtension: '3101'
      },
      {
        name: 'Dr. Robert Kim',
        email: 'robert.kim@edutech.edu',
        department: 'Physics',
        employeeId: 'PHY301',
        designation: 'Assistant Professor',
        qualifications: [
          { degree: 'Ph.D. in Quantum Physics', institution: 'Caltech', year: 2019 }
        ],
        specialization: ['Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'],
        experience: { years: 5, description: 'Research in quantum computing applications' },
        researchInterests: ['Quantum Computing', 'Nanotechnology', 'Material Science'],
        officeHours: [
          { day: 'Wednesday', startTime: '10:00 AM', endTime: '12:00 PM' },
          { day: 'Thursday', startTime: '2:00 PM', endTime: '4:00 PM' }
        ],
        officeLocation: 'Physics Building, Room 150',
        phoneExtension: '4101'
      },
      {
        name: 'Dr. Lisa Wang',
        email: 'lisa.wang@edutech.edu',
        department: 'Chemistry',
        employeeId: 'CHEM401',
        designation: 'Associate Professor',
        qualifications: [
          { degree: 'Ph.D. in Organic Chemistry', institution: 'Harvard University', year: 2014 }
        ],
        specialization: ['Organic Chemistry', 'Biochemistry', 'Analytical Chemistry'],
        experience: { years: 10, description: 'Research in pharmaceutical chemistry' },
        researchInterests: ['Drug Discovery', 'Chemical Biology', 'Green Chemistry'],
        officeHours: [
          { day: 'Tuesday', startTime: '1:00 PM', endTime: '3:00 PM' },
          { day: 'Thursday', startTime: '10:00 AM', endTime: '12:00 PM' }
        ],
        officeLocation: 'Chemistry Building, Room 210',
        phoneExtension: '5101'
      },
      {
        name: 'Prof. David Brown',
        email: 'david.brown@edutech.edu',
        department: 'Business',
        employeeId: 'BUS501',
        designation: 'Professor',
        qualifications: [
          { degree: 'Ph.D. in Business Administration', institution: 'Wharton School', year: 2005 }
        ],
        specialization: ['Strategic Management', 'Entrepreneurship', 'Finance'],
        experience: { years: 19, description: 'Extensive industry and academic experience' },
        researchInterests: ['Digital Transformation', 'Business Strategy', 'Innovation'],
        officeHours: [
          { day: 'Monday', startTime: '9:00 AM', endTime: '11:00 AM' },
          { day: 'Wednesday', startTime: '9:00 AM', endTime: '11:00 AM' }
        ],
        officeLocation: 'Business School, Room 305',
        phoneExtension: '6101'
      },
      {
        name: 'Dr. Maria Garcia',
        email: 'maria.garcia@edutech.edu',
        department: 'Engineering',
        employeeId: 'ENG601',
        designation: 'Assistant Professor',
        qualifications: [
          { degree: 'Ph.D. in Electrical Engineering', institution: 'Georgia Tech', year: 2020 }
        ],
        specialization: ['Circuit Design', 'Power Systems', 'Control Systems'],
        experience: { years: 4, description: 'Research in renewable energy systems' },
        researchInterests: ['Smart Grids', 'Renewable Energy', 'Power Electronics'],
        officeHours: [
          { day: 'Tuesday', startTime: '2:00 PM', endTime: '4:00 PM' },
          { day: 'Friday', startTime: '1:00 PM', endTime: '3:00 PM' }
        ],
        officeLocation: 'Engineering Building, Room 120',
        phoneExtension: '7101'
      },
      {
        name: 'Prof. James Wilson',
        email: 'james.wilson@edutech.edu',
        department: 'Arts',
        employeeId: 'ART701',
        designation: 'Associate Professor',
        qualifications: [
          { degree: 'M.F.A. in Visual Arts', institution: 'Rhode Island School of Design', year: 2012 }
        ],
        specialization: ['Digital Art', 'Art History', 'Sculpture'],
        experience: { years: 12, description: 'Exhibited artist and educator' },
        researchInterests: ['Digital Media', 'Contemporary Art', 'Cultural Studies'],
        officeHours: [
          { day: 'Monday', startTime: '2:00 PM', endTime: '4:00 PM' },
          { day: 'Thursday', startTime: '11:00 AM', endTime: '1:00 PM' }
        ],
        officeLocation: 'Arts Building, Studio 45',
        phoneExtension: '8101'
      }
    ];

    const facultyUsers = [];
    const facultyProfiles = [];

    for (const facultyInfo of facultyData) {
      // Create user account
      const user = await User.create({
        name: facultyInfo.name,
        email: facultyInfo.email,
        password: 'password123',
        role: 'faculty',
        profile: {
          phone: `+1${Math.floor(Math.random() * 900000000 + 100000000)}`,
          department: facultyInfo.department,
          avatar: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2,10)}?w=150&h=150&fit=crop&crop=face`
        }
      });

      // Create faculty profile
      const { name, email, ...facultyProfileData } = facultyInfo;
      const facultyProfile = await Faculty.create({
        user: user._id,
        ...facultyProfileData
      });

      facultyUsers.push(user);
      facultyProfiles.push(facultyProfile);
    }

    // ----- Create Students -----
    const studentUsers = [];
    const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Business', 'Engineering', 'Arts'];
    
    for (let i = 1; i <= 30; i++) {
      const dept = departments[i % departments.length];
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@edutech.edu`,
        password: 'password123',
        role: 'student',
        profile: {
          phone: `+1${5550000000 + i}`,
          department: dept,
          semester: `${Math.floor(Math.random() * 8 + 1)}`,
          rollNumber: `STU2024${i.toString().padStart(3, '0')}`,
          avatar: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2,10)}?w=150&h=150&fit=crop&crop=face`
        }
      });
      studentUsers.push(student);
    }

    // ----- Create Courses -----
    const coursesData = [
      {
        title: 'Introduction to Artificial Intelligence',
        code: 'CS401',
        description: 'Fundamental concepts of AI including search algorithms, knowledge representation, and machine learning basics.',
        credits: 4,
        department: 'Computer Science',
        semester: '7',
        faculty: facultyUsers[0]._id,
        capacity: 35,
        syllabus: [
          {
            topic: 'Introduction to AI',
            duration: '2 weeks',
            objectives: ['Understand AI history', 'Learn AI applications', 'Explore AI ethics']
          },
          {
            topic: 'Search Algorithms',
            duration: '3 weeks',
            objectives: ['Implement BFS/DFS', 'Understand heuristic search', 'Apply A* algorithm']
          }
        ],
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: '10:00 AM - 11:30 AM',
          classroom: 'CS-101'
        }
      },
      {
        title: 'Advanced Machine Learning',
        code: 'CS502',
        description: 'Deep dive into machine learning algorithms, neural networks, and deep learning architectures.',
        credits: 4,
        department: 'Computer Science',
        semester: '8',
        faculty: facultyUsers[0]._id,
        capacity: 30,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '2:00 PM - 3:30 PM',
          classroom: 'CS-201'
        }
      },
      {
        title: 'Calculus III',
        code: 'MATH301',
        description: 'Multivariable calculus including vector functions, partial derivatives, and multiple integrals.',
        credits: 3,
        department: 'Mathematics',
        semester: '3',
        faculty: facultyUsers[2]._id,
        capacity: 40,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '9:00 AM - 10:00 AM',
          classroom: 'MATH-101'
        }
      },
      {
        title: 'Quantum Physics',
        code: 'PHY401',
        description: 'Introduction to quantum mechanics, wave functions, and quantum systems.',
        credits: 4,
        department: 'Physics',
        semester: '7',
        faculty: facultyUsers[3]._id,
        capacity: 25,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '11:00 AM - 12:30 PM',
          classroom: 'PHY-301'
        }
      },
      {
        title: 'Organic Chemistry',
        code: 'CHEM302',
        description: 'Study of organic compounds, reactions, and synthesis methods.',
        credits: 3,
        department: 'Chemistry',
        semester: '5',
        faculty: facultyUsers[4]._id,
        capacity: 35,
        schedule: {
          days: ['Monday', 'Wednesday'],
          time: '1:00 PM - 2:30 PM',
          classroom: 'CHEM-201'
        }
      }
    ];

    const courses = [];
    for (const courseData of coursesData) {
      const course = await Course.create(courseData);
      courses.push(course);
    }

    // ----- Create Events -----
    // First, let's check what event types are allowed in your Event model
    // Common event types: 'workshop', 'seminar', 'conference', 'cultural', 'sports', 'academic'
    const eventsData = [
      {
        title: 'Annual Tech Symposium 2024',
        description: 'Join us for the biggest technology event of the year featuring industry experts, workshops, and networking opportunities.',
        date: new Date('2024-03-15T09:00:00'),
        endDate: new Date('2024-03-15T17:00:00'),
        venue: 'Main Auditorium',
        type: 'conference',
        organizer: 'Computer Science Department',
        maxParticipants: 200,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'AI and Machine Learning Workshop',
        description: 'Hands-on workshop covering the latest trends in AI and machine learning with practical coding sessions.',
        date: new Date('2024-02-20T10:00:00'),
        endDate: new Date('2024-02-20T16:00:00'),
        venue: 'CS Lab 301',
        type: 'workshop',
        organizer: 'AI Research Center',
        maxParticipants: 50,
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Career Development Seminar',
        description: 'Connect with top companies and explore internship and job opportunities across various industries.',
        date: new Date('2024-04-10T10:00:00'),
        endDate: new Date('2024-04-10T18:00:00'),
        venue: 'Sports Complex',
        type: 'seminar', // Changed from 'career' to 'seminar'
        organizer: 'Placement Cell',
        maxParticipants: 500,
        image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=300&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Mathematics Olympiad',
        description: 'Annual mathematics competition for students showcasing problem-solving skills and mathematical creativity.',
        date: new Date('2024-03-05T09:00:00'),
        endDate: new Date('2024-03-05T13:00:00'),
        venue: 'Mathematics Building',
        type: 'academic', // Changed from 'competition' to 'academic'
        organizer: 'Mathematics Department',
        maxParticipants: 100,
        status: 'upcoming'
      },
      {
        title: 'Research Paper Writing Seminar',
        description: 'Learn effective techniques for writing and publishing research papers from experienced faculty members.',
        date: new Date('2024-02-25T14:00:00'),
        endDate: new Date('2024-02-25T17:00:00'),
        venue: 'Library Conference Room',
        type: 'seminar',
        organizer: 'Research Development Cell',
        maxParticipants: 80,
        status: 'upcoming'
      },
      {
        title: 'Cultural Fest - Euphoria 2024',
        description: 'Three days of music, dance, drama, and cultural performances showcasing student talent.',
        date: new Date('2024-05-15T10:00:00'),
        endDate: new Date('2024-05-17T22:00:00'),
        venue: 'College Grounds',
        type: 'cultural',
        organizer: 'Student Council',
        maxParticipants: 1000,
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&h=300&fit=crop',
        status: 'upcoming'
      },
      {
        title: 'Sports Tournament 2024',
        description: 'Annual inter-department sports competition featuring cricket, football, basketball and more.',
        date: new Date('2024-04-20T08:00:00'),
        endDate: new Date('2024-04-22T18:00:00'),
        venue: 'Sports Ground',
        type: 'sports',
        organizer: 'Sports Committee',
        maxParticipants: 300,
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
        status: 'upcoming'
      }
    ];

    const events = [];
    for (const eventData of eventsData) {
      const event = await Event.create(eventData);
      events.push(event);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@edutech.edu / password123');
    console.log('\n👨‍🏫 Faculty Accounts:');
    facultyUsers.forEach(f => console.log(`   ${f.email} / password123`));
    console.log('\n👨‍🎓 Student Accounts:');
    console.log('   student1@edutech.edu / password123');
    console.log('   student2@edutech.edu / password123');
    console.log('   ... (30 students total)');
    
    console.log('\n📊 Data Summary:');
    console.log(`   Faculty: ${facultyUsers.length}`);
    console.log(`   Students: ${studentUsers.length}`);
    console.log(`   Courses: ${courses.length}`);
    console.log(`   Events: ${events.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.log('\n💡 Tip: Check your Event model to see what event types are allowed.');
    console.log('   Common types: workshop, seminar, conference, cultural, sports, academic');
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed.');
    process.exit(0);
  }
};

seedData();