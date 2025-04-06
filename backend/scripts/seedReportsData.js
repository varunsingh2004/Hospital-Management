const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Report = require('../models/Report');
const { faker } = require('@faker-js/faker');

dotenv.config({ path: '../.env' });

// Generate a random date between start and end
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random vital signs
const generateVitalSigns = () => {
  return {
    temperature: faker.number.float({ min: 97, max: 99.9, precision: 0.1 }),
    bloodPressure: `${faker.number.int({ min: 110, max: 140 })}/${faker.number.int({ min: 70, max: 95 })}`,
    heartRate: faker.number.int({ min: 60, max: 100 }),
    respiratoryRate: faker.number.int({ min: 12, max: 20 }),
    oxygenSaturation: faker.number.int({ min: 95, max: 100 }),
    height: faker.number.int({ min: 150, max: 190 }),
    weight: faker.number.int({ min: 50, max: 100 })
  };
};

// Generate common medications
const generateMedications = (count) => {
  const medications = [];
  const commonMeds = [
    'Acetaminophen',
    'Ibuprofen',
    'Amoxicillin',
    'Azithromycin',
    'Lisinopril',
    'Atorvastatin',
    'Metformin',
    'Levothyroxine',
    'Albuterol',
    'Omeprazole'
  ];
  
  const frequencies = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'As needed'
  ];
  
  const durations = [
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '30 days',
    '3 months',
    'Ongoing'
  ];
  
  for (let i = 0; i < count; i++) {
    medications.push({
      name: commonMeds[Math.floor(Math.random() * commonMeds.length)],
      dosage: `${faker.number.int({ min: 25, max: 1000 })}mg`,
      frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      duration: durations[Math.floor(Math.random() * durations.length)],
      notes: Math.random() > 0.7 ? faker.lorem.sentence() : ''
    });
  }
  
  return medications;
};

// Generate lab tests
const generateTests = (count) => {
  const tests = [];
  const commonTests = [
    'Complete Blood Count',
    'Basic Metabolic Panel',
    'Comprehensive Metabolic Panel',
    'Lipid Panel',
    'Liver Function Tests',
    'Thyroid Function Tests',
    'Hemoglobin A1C',
    'Urinalysis',
    'Electrocardiogram',
    'Chest X-ray',
    'MRI',
    'CT Scan',
    'Ultrasound'
  ];
  
  const statuses = ['ordered', 'in-progress', 'completed'];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    tests.push({
      name: commonTests[Math.floor(Math.random() * commonTests.length)],
      status,
      date: status === 'ordered' ? null : getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      result: status === 'completed' ? faker.lorem.sentence() : '',
      notes: Math.random() > 0.7 ? faker.lorem.sentence() : ''
    });
  }
  
  return tests;
};

// Generate report data
const generateReportData = (patient, doctor) => {
  const reportDate = getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  const hasFollowUp = Math.random() > 0.3;
  const followUpDate = hasFollowUp ? 
    new Date(reportDate.getTime() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000) : 
    null;
  
  const commonDiagnoses = [
    'Common Cold',
    'Hypertension',
    'Type 2 Diabetes',
    'Urinary Tract Infection',
    'Pneumonia',
    'Influenza',
    'Gastroenteritis',
    'Migraine',
    'Acute Bronchitis',
    'Lower Back Pain',
    'Asthma',
    'Rhinitis',
    'Pharyngitis',
    'Sinusitis',
    'Anxiety Disorder',
    'Osteoarthritis',
    'Gastroesophageal Reflux Disease'
  ];
  
  const diagnosis = commonDiagnoses[Math.floor(Math.random() * commonDiagnoses.length)];
  
  return {
    patientId: patient._id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    doctorId: doctor._id,
    doctorName: `${doctor.firstName} ${doctor.lastName}`,
    reportDate,
    symptoms: faker.lorem.paragraph(),
    diagnosis,
    treatment: Math.random() > 0.2 ? faker.lorem.paragraph() : '',
    recommendations: Math.random() > 0.3 ? faker.lorem.paragraph() : '',
    tests: Math.random() > 0.3 ? generateTests(Math.floor(Math.random() * 3) + 1) : [],
    medications: Math.random() > 0.2 ? generateMedications(Math.floor(Math.random() * 3) + 1) : [],
    vitalSigns: Math.random() > 0.2 ? generateVitalSigns() : {},
    followUpDate,
    notes: Math.random() > 0.5 ? faker.lorem.paragraph() : '',
    status: faker.helpers.arrayElement(['draft', 'final', 'amended', 'draft'])
  };
};

// Seed Reports
const seedReports = async () => {
  try {
    // Clear existing reports
    await Report.deleteMany({});
    console.log('Cleared existing reports');
    
    // Get all patients and doctors
    const patients = await Patient.find({});
    const doctors = await Doctor.find({});
    
    if (patients.length === 0 || doctors.length === 0) {
      console.error('No patients or doctors found. Please seed patients and doctors first.');
      throw new Error('No patients or doctors found');
    }
    
    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);
    
    // Generate random reports (1-3 per patient)
    const reports = [];
    
    for (const patient of patients) {
      const reportCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < reportCount; i++) {
        // Randomly assign a doctor to the report
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        
        // Generate report data
        const reportData = generateReportData(patient, doctor);
        reports.push(reportData);
      }
    }
    
    // Insert reports
    const result = await Report.insertMany(reports);
    
    console.log(`Successfully seeded ${reports.length} reports`);
    return result;
  } catch (error) {
    console.error('Error seeding reports:', error);
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
      await seedReports();
      console.log('Reports seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedReports; 