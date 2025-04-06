const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { faker } = require('@faker-js/faker');

dotenv.config({ path: '../.env' });

// Generate a random date between start and end
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate a random time in HH:MM format (24-hour)
const getRandomTime = (startHour = 8, endHour = 17) => {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Calculate end time based on start time and duration
const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};

// Seed Appointments
const seedAppointments = async () => {
  try {
    // Clear existing appointments
    await Appointment.deleteMany({});
    console.log('Cleared existing appointments');
    
    // Get all patients, doctors, and find an admin user
    const patients = await Patient.find({});
    const doctors = await Doctor.find({});
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // If no admin user, create one
      adminUser = await User.findOne({});
      
      if (!adminUser) {
        console.error('No users found. Please create at least one user first.');
        throw new Error('No users found');
      }
    }
    
    if (patients.length === 0 || doctors.length === 0) {
      console.error('No patients or doctors found. Please seed patients and doctors first.');
      throw new Error('No patients or doctors found');
    }
    
    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);
    
    // Create appointments for the past week, current week, and next week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    
    // Create 50 random appointments
    const appointmentCount = 50;
    
    // Define departments based on doctor specializations
    const departments = Array.from(new Set(doctors.map(d => d.specialization || 'General Medicine')));
    
    // Array to store created appointments
    const createdAppointments = [];
    
    // Generate and save appointments one by one
    console.log('Creating random appointments...');
    for (let i = 0; i < appointmentCount; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      const appointmentDate = getRandomDate(twoWeeksAgo, twoWeeksLater);
      const startTime = getRandomTime();
      const duration = 30; // 30 minutes per appointment
      const endTime = calculateEndTime(startTime, duration);
      
      // Define status based on date
      let status = 'Scheduled';
      if (appointmentDate < today) {
        status = faker.helpers.arrayElement(['Completed', 'Cancelled', 'No-Show', 'Completed', 'Completed']); // Bias towards completed
      }
      
      const appointmentData = {
        patient: {
          patientId: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          phoneNumber: patient.phoneNumber,
          email: patient.email
        },
        doctor: {
          doctorId: doctor._id,
          name: `${doctor.firstName} ${doctor.lastName}`
        },
        department: doctor.specialization || 'General Medicine',
        appointmentDate,
        startTime,
        endTime,
        duration,
        status,
        notes: Math.random() > 0.7 ? faker.lorem.sentence() : '',
        createdBy: adminUser._id
      };
      
      const appointment = new Appointment(appointmentData);
      const savedAppointment = await appointment.save();
      createdAppointments.push(savedAppointment);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Created ${i + 1} appointments so far...`);
      }
    }
    
    // Create more appointments for today specifically
    console.log('Creating today\'s appointments...');
    for (let i = 0; i < 10; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      const todayCopy = new Date(today);
      const startTime = getRandomTime();
      const duration = 30;
      const endTime = calculateEndTime(startTime, duration);
      
      const appointmentData = {
        patient: {
          patientId: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          phoneNumber: patient.phoneNumber,
          email: patient.email
        },
        doctor: {
          doctorId: doctor._id,
          name: `${doctor.firstName} ${doctor.lastName}`
        },
        department: doctor.specialization || 'General Medicine',
        appointmentDate: todayCopy,
        startTime,
        endTime,
        duration,
        status: 'Scheduled',
        notes: Math.random() > 0.7 ? faker.lorem.sentence() : '',
        createdBy: adminUser._id
      };
      
      const appointment = new Appointment(appointmentData);
      const savedAppointment = await appointment.save();
      createdAppointments.push(savedAppointment);
    }
    
    console.log(`Successfully created ${createdAppointments.length} appointments`);
    return createdAppointments;
  } catch (error) {
    console.error('Error seeding appointments:', error);
    throw error;
  }
};

// Allow the script to be run directly or imported
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log('Connected to MongoDB Atlas');
      await seedAppointments();
      console.log('Appointments seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedAppointments; 