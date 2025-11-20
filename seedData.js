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

    // ----- Create Admin -----
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@edutech.edu',
      password: 'password123',
      role: 'admin',
      profile: { phone: '+1234567892', department: 'Administration' }
    });

    // ----- Create Faculty -----
    const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'];
    const facultyUsers = [];
    const facultyProfiles = [];

    for (let i = 1; i <= 10; i++) {
      const dept = departments[i % departments.length];
      const user = await User.create({
        name: `Faculty ${i}`,
        email: `faculty${i}@edutech.edu`,
        password: 'password123',
        role: 'faculty',
        profile: {
          phone: '+12345000' + i,
          department: dept,
          address: {
            street: `${i} Faculty Street`,
            city: 'Education City',
            state: 'EC',
            zipCode: '12345'
          }
        }
      });

      const facultyProfile = await Faculty.create({
        user: user._id,
        employeeId: `FAC${100 + i}`,
        department: dept,
        designation: i % 2 === 0 ? 'Professor' : 'Lecturer',
        specialization: i % 2 === 0 ? ['AI', 'ML'] : ['Calculus', 'Algebra'],
        experience: { years: Math.floor(Math.random() * 10 + 5), description: 'Experienced in teaching and research' },
        researchInterests: ['Research Topic A', 'Research Topic B'],
        officeHours: [
          { day: 'Monday', startTime: '10:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '16:00' }
        ],
        officeLocation: `${dept} Building`,
        phoneExtension: '' + Math.floor(Math.random() * 9000 + 1000)
      });

      facultyUsers.push(user);
      facultyProfiles.push(facultyProfile);
    }

    // ----- Create Students -----
    const studentUsers = [];
    for (let i = 1; i <= 20; i++) {
      const dept = departments[i % departments.length];
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@edutech.edu`,
        password: 'password123',
        role: 'student',
        profile: {
          phone: '+98765000' + i,
          department: dept,
          semester: `${Math.floor(Math.random() * 8 + 1)}`,
          address: {
            street: `${i} Student Lane`,
            city: 'Education City',
            state: 'EC',
            zipCode: '12345'
          }
        }
      });
      studentUsers.push(student);
    }

    // ----- Create Courses -----
    const courses = [];
    for (let i = 1; i <= 20; i++) {
      const dept = departments[i % departments.length];
      const faculty = facultyUsers[i % facultyUsers.length];
      const course = await Course.create({
        title: `${dept} Course ${i}`,
        code: `${dept.substring(0, 3).toUpperCase()}${100 + i}`,
        description: `Detailed syllabus for ${dept} Course ${i}`,
        credits: 3 + (i % 2),
        department: dept,
        semester: `${(i % 8) + 1}`,
        faculty: faculty._id,
        capacity: 20 + (i % 10)
      });
      courses.push(course);
    }

    // ----- Create Events -----
    const events = [];
    for (let i = 1; i <= 20; i++) {
      const dept = departments[i % departments.length];
      const event = await Event.create({
        title: `${dept} Event ${i}`,
        description: `Description of ${dept} Event ${i}`,
        date: new Date(`2024-0${(i % 9) + 1}-10T09:00:00`),
        endDate: new Date(`2024-0${(i % 9) + 1}-10T17:00:00`),
        venue: `${dept} Hall ${i}`,
        type: i % 2 === 0 ? 'workshop' : 'conference',
        organizer: `${dept} Department`,
        maxParticipants: 20 + (i * 5)
      });
      events.push(event);
    }

    console.log('Seed data created successfully!');
    console.log('Admin login: admin@edutech.edu / password123');
    facultyUsers.forEach(f => console.log(`Faculty login: ${f.email} / password123`));
    studentUsers.forEach(s => console.log(`Student login: ${s.email} / password123`));

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();
