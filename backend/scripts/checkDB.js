const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Billing = require('../models/Billing');
const connectDB = require('../config/db');

// Connect to database
connectDB().then(() => console.log(`MongoDB Connected: ${mongoose.connection.host}`));

const checkDB = async () => {
  try {
    // Count records in each collection
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const billingCount = await Billing.countDocuments();
    
    console.log("\n=== DATABASE SUMMARY ===");
    console.log(`Found ${patientCount} patients in the database`);
    console.log(`Found ${doctorCount} doctors in the database`);
    console.log(`Found ${billingCount} billing records in the database`);
    console.log("========================\n");
    
    // Check patients - using specific Patient model fields
    if (patientCount > 0) {
      console.log('=== SAMPLE PATIENTS ===');
      const patients = await Patient.find({
        firstName: { $exists: true },
        lastName: { $exists: true },
        salutation: { $exists: true }
      }).limit(5);
      
      if (patients.length > 0) {
        patients.forEach(patient => {
          console.log(`- ${patient._id}: ${patient.salutation} ${patient.firstName} ${patient.lastName} (${patient.patientId || 'No ID'})`);
        });
      } else {
        console.log("No patient data found with expected fields");
      }
      console.log("");
    }
    
    // Check doctors - using specific Doctor model fields
    if (doctorCount > 0) {
      console.log('=== SAMPLE DOCTORS ===');
      const doctors = await Doctor.find({
        firstName: { $exists: true },
        lastName: { $exists: true },
        doctorId: { $exists: true }
      }).limit(3);
      
      if (doctors.length > 0) {
        doctors.forEach(doctor => {
          console.log(`- ${doctor._id}: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.doctorId || 'No ID'}), Specialization: ${doctor.specialization || 'Not specified'}`);
        });
      } else {
        console.log("No doctor data found with expected fields");
      }
      console.log("");
    }
    
    // Check billing records - using specific Billing model fields
    if (billingCount > 0) {
      console.log('=== SAMPLE BILLING RECORDS ===');
      const billings = await Billing.find({
        patientName: { $exists: true },
        doctorName: { $exists: true }, 
        totalAmount: { $exists: true }
      }).limit(3);
      
      if (billings.length > 0) {
        billings.forEach(billing => {
          console.log(`- ${billing._id}: ${billing.patientName} | ${billing.doctorName} | $${billing.totalAmount} (${billing.paymentStatus})`);
        });
      } else {
        console.log("No billing data found with expected fields");
      }
      console.log("");
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDB(); 