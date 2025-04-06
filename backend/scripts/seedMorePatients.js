const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const seedMorePatients = async () => {
  try {
    // Find admin user to use as registeredBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please seed users first.');
    }

    const additionalPatients = [
      {
        salutation: 'Mr',
        firstName: 'William',
        lastName: 'Anderson',
        dateOfBirth: new Date('1982-07-15'),
        age: 41,
        gender: 'Male',
        phoneNumber: '+1-555-0007',
        email: 'william.anderson@example.com',
        address: '567 Maple Dr',
        country: 'United States',
        state: 'Florida',
        occupation: 'Business Analyst',
        membershipType: 'Gold (10%)',
        maritalStatus: 'Married',
        notifications: true,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-03-05'),
        chiefComplaint: 'Joint pain',
        diagnosisNotes: 'Patient reports joint pain in knees and ankles',
        assignedDoctor: 'Dr. Michael Chen',
        treatmentPlan: 'Physical therapy and anti-inflammatory medication',
        followUpDate: new Date('2024-04-05'),
        guarantorName: 'Mary Anderson',
        guarantorRelation: 'Spouse',
        guarantorPhone: '+1-555-0008',
        guarantorAddress: '567 Maple Dr',
        insuranceProvider: 'Cigna',
        policyNumber: 'CI567890',
        groupNumber: 'G345',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'Mary Anderson',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+1-555-0008',
        emergencyContactAddress: '567 Maple Dr'
      },
      {
        salutation: 'Mrs',
        firstName: 'Patricia',
        lastName: 'Martinez',
        dateOfBirth: new Date('1978-09-28'),
        age: 45,
        gender: 'Female',
        phoneNumber: '+1-555-0009',
        email: 'patricia.martinez@example.com',
        address: '890 Cedar Ln',
        country: 'United States',
        state: 'Arizona',
        occupation: 'Accountant',
        membershipType: 'Platinum (15%)',
        maritalStatus: 'Married',
        notifications: true,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-02-28'),
        chiefComplaint: 'Digestive issues',
        diagnosisNotes: 'Patient reports frequent stomach pain and acid reflux',
        assignedDoctor: 'Dr. John Smith',
        treatmentPlan: 'Dietary changes and acid reflux medication',
        followUpDate: new Date('2024-03-28'),
        guarantorName: 'Carlos Martinez',
        guarantorRelation: 'Spouse',
        guarantorPhone: '+1-555-0010',
        guarantorAddress: '890 Cedar Ln',
        insuranceProvider: 'Humana',
        policyNumber: 'HU234567',
        groupNumber: 'G567',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'Carlos Martinez',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+1-555-0010',
        emergencyContactAddress: '890 Cedar Ln'
      },
      {
        salutation: 'Mr',
        firstName: 'Robert',
        lastName: 'Wilson',
        dateOfBirth: new Date('1992-11-03'),
        age: 31,
        gender: 'Male',
        phoneNumber: '+1-555-0011',
        email: 'robert.wilson@example.com',
        address: '234 Birch St',
        country: 'United States',
        state: 'Washington',
        occupation: 'Software Developer',
        membershipType: 'Diamond (20%)',
        maritalStatus: 'Unmarried',
        notifications: true,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-03-15'),
        chiefComplaint: 'Vision problems',
        diagnosisNotes: 'Patient reports blurred vision and eye strain',
        assignedDoctor: 'Dr. Sarah Johnson',
        treatmentPlan: 'Eye examination and prescription glasses',
        followUpDate: new Date('2024-04-15'),
        guarantorName: 'James Wilson',
        guarantorRelation: 'Father',
        guarantorPhone: '+1-555-0012',
        guarantorAddress: '432 Oak St',
        insuranceProvider: 'Kaiser',
        policyNumber: 'KP789012',
        groupNumber: 'G789',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'James Wilson',
        emergencyContactRelation: 'Father',
        emergencyContactPhone: '+1-555-0012',
        emergencyContactAddress: '432 Oak St'
      },
      {
        salutation: 'Ms',
        firstName: 'Jennifer',
        lastName: 'Taylor',
        dateOfBirth: new Date('1988-04-17'),
        age: 35,
        gender: 'Female',
        phoneNumber: '+1-555-0013',
        email: 'jennifer.taylor@example.com',
        address: '678 Pine Ave',
        country: 'United States',
        state: 'Oregon',
        occupation: 'Graphic Designer',
        membershipType: 'General (0%)',
        maritalStatus: 'Unmarried',
        notifications: false,
        registeredBy: adminUser._id,
        diagnosisDate: new Date('2024-03-20'),
        chiefComplaint: 'Anxiety symptoms',
        diagnosisNotes: 'Patient reports increased anxiety and sleep issues',
        assignedDoctor: 'Dr. David Wilson',
        treatmentPlan: 'Counseling referral and stress management techniques',
        followUpDate: new Date('2024-04-20'),
        guarantorName: 'Margaret Taylor',
        guarantorRelation: 'Mother',
        guarantorPhone: '+1-555-0014',
        guarantorAddress: '789 Elm St',
        insuranceProvider: 'Anthem',
        policyNumber: 'AN345678',
        groupNumber: 'G234',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31'),
        emergencyContactName: 'Margaret Taylor',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '+1-555-0014',
        emergencyContactAddress: '789 Elm St'
      }
    ];

    console.log('Adding 4 additional patients...');
    
    // Create new patients sequentially
    const createdPatients = [];
    for (const patientData of additionalPatients) {
      const patient = new Patient(patientData);
      const savedPatient = await patient.save();
      createdPatients.push(savedPatient);
    }

    console.log(`${createdPatients.length} additional patients created`);
    return createdPatients;
  } catch (error) {
    console.error('Error seeding additional patients:', error);
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
      await seedMorePatients();
      console.log('Additional patients seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedMorePatients; 