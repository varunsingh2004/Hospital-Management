const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const seedDoctors = async () => {
  try {
    // Find admin user to use as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please seed users first.');
    }

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Existing doctors cleared');

    const doctors = [
      {
        firstName: "John",
        lastName: "Smith",
        gender: "Male",
        photo: "https://randomuser.me/api/portraits/men/1.jpg",
        specialization: "Cardiology",
        qualification: "MD, FACC",
        experience: 15,
        department: "Cardiology",
        phoneNumber: "+1-555-0123",
        email: "john.smith@hospital.com",
        address: "123 Medical Center Blvd",
        status: "Active",
        consultationFee: 150,
        designation: "Senior Consultant",
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTimeSlots: {
          start: "09:00",
          end: "17:00"
        },
        createdBy: adminUser._id,
        bio: "Dr. Smith is a leading cardiologist with extensive experience in treating cardiovascular diseases."
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        gender: "Female",
        photo: "https://randomuser.me/api/portraits/women/2.jpg",
        specialization: "Pediatrics",
        qualification: "MD, FAAP",
        experience: 12,
        department: "Pediatrics",
        phoneNumber: "+1-555-0124",
        email: "sarah.johnson@hospital.com",
        address: "456 Children's Way",
        status: "Active",
        consultationFee: 120,
        designation: "Consultant",
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        availableTimeSlots: {
          start: "10:00",
          end: "18:00"
        },
        createdBy: adminUser._id,
        bio: "Dr. Johnson specializes in pediatric care with a focus on child development."
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        gender: "Male",
        photo: "https://randomuser.me/api/portraits/men/3.jpg",
        specialization: "Orthopedics",
        qualification: "MD, FAAOS",
        experience: 18,
        department: "Orthopedics",
        phoneNumber: "+1-555-0125",
        email: "michael.chen@hospital.com",
        address: "789 Bone & Joint Ave",
        status: "Active",
        consultationFee: 160,
        designation: "Senior Specialist",
        availableDays: ["Monday", "Tuesday", "Thursday"],
        availableTimeSlots: {
          start: "08:00",
          end: "16:00"
        },
        createdBy: adminUser._id,
        bio: "Dr. Chen is an experienced orthopedic surgeon specializing in sports injuries."
      },
      {
        firstName: "Emily",
        lastName: "Brown",
        gender: "Female",
        photo: "https://randomuser.me/api/portraits/women/4.jpg",
        specialization: "Dermatology",
        qualification: "MD, FAAD",
        experience: 10,
        department: "Dermatology",
        phoneNumber: "+1-555-0126",
        email: "emily.brown@hospital.com",
        address: "321 Skin Care Lane",
        status: "Active",
        consultationFee: 140,
        designation: "Specialist",
        availableDays: ["Wednesday", "Friday", "Saturday"],
        availableTimeSlots: {
          start: "09:30",
          end: "17:30"
        },
        createdBy: adminUser._id,
        bio: "Dr. Brown specializes in clinical and cosmetic dermatology."
      },
      {
        firstName: "David",
        lastName: "Wilson",
        gender: "Male",
        photo: "https://randomuser.me/api/portraits/men/5.jpg",
        specialization: "Neurology",
        qualification: "MD, FAAN",
        experience: 20,
        department: "Neurology",
        phoneNumber: "+1-555-0127",
        email: "david.wilson@hospital.com",
        address: "654 Brain Center Road",
        status: "Active",
        consultationFee: 180,
        designation: "HOD",
        availableDays: ["Monday", "Wednesday", "Friday"],
        availableTimeSlots: {
          start: "08:30",
          end: "16:30"
        },
        createdBy: adminUser._id,
        bio: "Dr. Wilson is a renowned neurologist with expertise in treating complex neurological disorders."
      }
    ];

    // Create new doctors sequentially
    const createdDoctors = [];
    for (const doctorData of doctors) {
      const doctor = new Doctor(doctorData);
      const savedDoctor = await doctor.save();
      createdDoctors.push(savedDoctor);
    }

    console.log(`${createdDoctors.length} doctors created`);
    return createdDoctors;
  } catch (error) {
    console.error('Error seeding doctors:', error);
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
      await seedDoctors();
      console.log('Doctors seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedDoctors; 