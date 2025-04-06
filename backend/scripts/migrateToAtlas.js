const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateToAtlas = async () => {
  try {
    // Connect to MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas successfully');

    // Run seed scripts in sequence
    console.log('\nStarting data migration...\n');

    // Import and run each seed script
    console.log('1. Seeding Users...');
    await require('./seedUsers')();
    console.log('✓ Users seeded successfully\n');

    console.log('2. Seeding Doctors...');
    await require('./seedDoctors')();
    console.log('✓ Doctors seeded successfully\n');

    console.log('3. Seeding Initial Patients...');
    await require('./seedPatients')();
    console.log('✓ Initial patients seeded successfully\n');

    console.log('4. Seeding Additional Patients...');
    await require('./seedMorePatients')();
    console.log('✓ Additional patients seeded successfully\n');

    console.log('5. Updating Patient Details...');
    await require('./updatePatientDetails')();
    console.log('✓ Patient details updated successfully\n');

    console.log('6. Seeding Appointments...');
    await require('./seedAppointments')();
    console.log('✓ Appointments seeded successfully\n');

    console.log('7. Seeding Billing Data...');
    await require('./seedBillingData')();
    console.log('✓ Billing data seeded successfully\n');

    console.log('8. Seeding Reports Data...');
    await require('./seedReportsData')();
    console.log('✓ Reports data seeded successfully\n');

    console.log('✨ Data migration completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run migration
migrateToAtlas(); 