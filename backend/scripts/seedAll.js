require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Execute a script and wait for it to finish
const executeScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    console.log(`\n========== Running ${scriptName} ==========`);
    
    const scriptPath = path.join(__dirname, scriptName);
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${scriptName} failed with code ${code}`);
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`❌ Error executing ${scriptName}:`, err);
      reject(err);
    });
  });
};

// Run all seeders in sequence
const runSeeders = async () => {
  try {
    // Order matters here - start with users, then entities that depend on them
    const scripts = [
      'seedUsers.js',        // 1. Create users first (including admin user needed for appointments)
      'seedDoctors.js',      // 2. Create doctors
      'seedPatients.js',     // 3. Create patients
      'seedBillingData.js',  // 4. Create billing (needs patients and doctors)
      'seedReportsData.js',  // 5. Create reports (needs patients and doctors)
      'seedAppointments.js', // 6. Create appointments (needs patients, doctors, users)
      'fixReportIds.js',     // 7. Fix any missing report IDs
    ];
    
    // Run scripts in sequence
    for (const script of scripts) {
      await executeScript(script);
    }
    
    console.log('\n✅ All data seeded successfully!');
    console.log('\nYou can now log in with these credentials:');
    console.log('- Admin: admin@hospital.com / admin123');
    console.log('- Doctor: doctor@hospital.com / doctor123');
    console.log('- Staff: staff@hospital.com / staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding process failed:', error.message);
    process.exit(1);
  }
};

// Start the seeding process
console.log('🌱 Starting database seeding process...');
runSeeders(); 