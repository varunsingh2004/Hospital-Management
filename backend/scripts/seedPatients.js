const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const seedPatients = async () => {
  try {
    // Find admin user to use as registeredBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please seed users first.');
    }

    // Clear existing patients
    await Patient.deleteMany({});
    console.log('Existing patients cleared');

    const patients = [
      {
        salutation: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-05-15'),
        age: 33,
        gender: 'Male',
        phoneNumber: '+1-555-0001',
        email: 'john.doe@example.com',
        address: '123 Main St',
        country: 'United States',
        state: 'California',
        occupation: 'Engineer',
        membershipType: 'Gold (10%)',
        maritalStatus: 'Married',
        notifications: true,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-03-01'),
        chiefComplaint: 'Persistent headache',
        diagnosisNotes: 'Patient reports frequent headaches lasting 2-3 hours',
        assignedDoctor: 'Dr. David Wilson',
        treatmentPlan: 'Prescribed pain medication and stress management techniques',
        followUpDate: new Date('2024-04-15'),
        guarantorName: 'Jane Doe',
        guarantorRelation: 'Spouse',
        guarantorPhone: '+1-555-0002',
        guarantorAddress: '123 Main St',
        insuranceProvider: 'Blue Cross',
        policyNumber: 'BC123456',
        groupNumber: 'G789',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'Jane Doe',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+1-555-0002',
        emergencyContactAddress: '123 Main St'
      },
      {
        salutation: 'Mrs',
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: new Date('1985-08-22'),
        age: 38,
        gender: 'Female',
        phoneNumber: '+1-555-0003',
        email: 'sarah.johnson@example.com',
        address: '456 Oak Ave',
        country: 'United States',
        state: 'New York',
        occupation: 'Teacher',
        membershipType: 'Platinum (15%)',
        maritalStatus: 'Married',
        notifications: true,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-02-15'),
        chiefComplaint: 'Lower back pain',
        diagnosisNotes: 'Patient experiences chronic lower back pain',
        assignedDoctor: 'Dr. Michael Chen',
        treatmentPlan: 'Physical therapy sessions twice a week',
        followUpDate: new Date('2024-04-01'),
        guarantorName: 'Robert Johnson',
        guarantorRelation: 'Spouse',
        guarantorPhone: '+1-555-0004',
        guarantorAddress: '456 Oak Ave',
        insuranceProvider: 'Aetna',
        policyNumber: 'AE789012',
        groupNumber: 'G456',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'Robert Johnson',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+1-555-0004',
        emergencyContactAddress: '456 Oak Ave'
      },
      {
        salutation: 'Ms',
        firstName: 'Emily',
        lastName: 'Brown',
        dateOfBirth: new Date('1995-03-10'),
        age: 29,
        gender: 'Female',
        phoneNumber: '+1-555-0005',
        email: 'emily.brown@example.com',
        address: '789 Pine St',
        country: 'United States',
        state: 'Texas',
        occupation: 'Marketing Manager',
        membershipType: 'Diamond (20%)',
        maritalStatus: 'Unmarried',
        notifications: false,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-03-10'),
        chiefComplaint: 'Skin rash',
        diagnosisNotes: 'Patient presents with itchy rash on arms',
        assignedDoctor: 'Dr. Emily Brown',
        treatmentPlan: 'Prescribed topical cream and antihistamines',
        followUpDate: new Date('2024-03-24'),
        guarantorName: 'Michael Brown',
        guarantorRelation: 'Father',
        guarantorPhone: '+1-555-0006',
        guarantorAddress: '321 Elm St',
        insuranceProvider: 'United Healthcare',
        policyNumber: 'UH345678',
        groupNumber: 'G123',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'Michael Brown',
        emergencyContactRelation: 'Father',
        emergencyContactPhone: '+1-555-0006',
        emergencyContactAddress: '321 Elm St'
      }
    ];

    // Create new patients sequentially
    const createdPatients = [];
    for (const patientData of patients) {
      const patient = new Patient(patientData);
      const savedPatient = await patient.save();
      createdPatients.push(savedPatient);
    }

    console.log(`${createdPatients.length} patients created`);
    return createdPatients;
  } catch (error) {
    console.error('Error seeding patients:', error);
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
      await seedPatients();
      console.log('Patients seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedPatients; 