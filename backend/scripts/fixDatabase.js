const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Billing = require('../models/Billing');
const connectDB = require('../config/db');

// Connect to database
connectDB().then(() => console.log(`MongoDB Connected: ${mongoose.connection.host}`));

const fixDatabase = async () => {
  try {
    console.log('\n=== DATABASE REPAIR UTILITY ===');
    
    // 1. Fix patients collection
    console.log('\nChecking patients collection...');
    const patients = await Patient.find();
    console.log(`Found ${patients.length} patient records`);
    
    // Create a dummy user ID for registeredBy field if needed
    const dummyUserId = new mongoose.Types.ObjectId("67f26ac87e07e5a6e9c54ada");
    
    let patientFixed = 0;
    for (const patient of patients) {
      let needsUpdate = false;
      let updates = {};
      
      // Check for missing required fields and fix them
      if (!patient.patientId) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const randomNum = (Math.floor(Math.random() * 1000) + 1).toString().padStart(4, '0');
        updates.patientId = `P-${year}-${month}-${randomNum}`;
        needsUpdate = true;
      }
      
      if (!patient.registeredBy) {
        updates.registeredBy = dummyUserId;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await Patient.updateOne({ _id: patient._id }, { $set: updates });
        patientFixed++;
        console.log(`Fixed patient: ${patient.firstName} ${patient.lastName}`);
      }
    }
    console.log(`Fixed ${patientFixed} patient records`);
    
    // 2. Fix doctors collection
    console.log('\nChecking doctors collection...');
    const doctors = await Doctor.find();
    console.log(`Found ${doctors.length} doctor records`);
    
    // 3. Fix billing collection - correct any invalid references
    console.log('\nChecking billing collection...');
    const billings = await Billing.find();
    console.log(`Found ${billings.length} billing records`);
    
    let billingFixed = 0;
    for (const billing of billings) {
      let needsUpdate = false;
      let updates = {};
      
      // Check if billing ID is missing
      if (!billing.billingId) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const randomNum = (Math.floor(Math.random() * 1000) + 1).toString().padStart(3, '0');
        updates.billingId = `BILL-${year}${month}${day}-${randomNum}`;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await Billing.updateOne({ _id: billing._id }, { $set: updates });
        billingFixed++;
        console.log(`Fixed billing record: ${billing._id}`);
      }
    }
    console.log(`Fixed ${billingFixed} billing records\n`);
    
    // 4. Final report
    console.log('=== REPAIR SUMMARY ===');
    console.log(`Patients fixed: ${patientFixed}`);
    console.log(`Billings fixed: ${billingFixed}`);
    console.log('=====================\n');
    
    console.log('Database repair completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

fixDatabase(); 