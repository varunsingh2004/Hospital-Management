const mongoose = require('mongoose');
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Sample billing data
const generateBillingData = async () => {
  try {
    // Get actual patients and doctors from database
    const patients = await Patient.find({}).limit(10);
    const doctors = await Doctor.find().limit(5);
    
    if (patients.length === 0 || doctors.length === 0) {
      console.log('No patients or doctors found. Please seed patient and doctor data first.');
      console.log(`Found ${patients.length} patients and ${doctors.length} doctors.`);
      throw new Error('No patients or doctors found');
    }
    
    console.log(`Found ${patients.length} patients and ${doctors.length} doctors for generating billing data.`);
    
    const paymentStatuses = ['paid', 'pending', 'overdue', 'cancelled'];
    const paymentMethods = ['cash', 'credit card', 'insurance', 'bank transfer', 'check'];
    
    const commonServices = [
      { name: 'General Consultation', price: 50 },
      { name: 'Specialist Consultation', price: 100 },
      { name: 'Blood Test', price: 35 },
      { name: 'X-Ray', price: 75 },
      { name: 'MRI Scan', price: 350 },
      { name: 'CT Scan', price: 250 },
      { name: 'Ultrasound', price: 120 },
      { name: 'ECG', price: 60 },
      { name: 'Physical Therapy Session', price: 85 },
      { name: 'Vaccination', price: 40 },
      { name: 'Minor Surgery', price: 300 },
      { name: 'Dental Cleaning', price: 80 },
      { name: 'Emergency Room Visit', price: 200 }
    ];
    
    // Generate random date within the last 6 months
    const getRandomDate = () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
      return new Date(sixMonthsAgo.getTime() + Math.random() * (new Date().getTime() - sixMonthsAgo.getTime()));
    };
    
    // Generate random services for a bill
    const getRandomServices = () => {
      const numServices = Math.floor(Math.random() * 4) + 1; // 1-4 services
      const services = [];
      
      for (let i = 0; i < numServices; i++) {
        const service = commonServices[Math.floor(Math.random() * commonServices.length)];
        services.push({
          name: service.name,
          price: service.price,
          quantity: Math.floor(Math.random() * 2) + 1 // 1-2 quantity
        });
      }
      
      return services;
    };
    
    // Generate bills
    const billingData = [];
    
    // Create a smaller number of billing records for testing
    const numBillings = Math.min(20, patients.length * doctors.length);
    
    for (let i = 0; i < numBillings; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const services = getRandomServices();
      const totalAmount = services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
      const date = getRandomDate();
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // Format the doctor name properly
      const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
      
      // Generate a random billing ID to avoid duplicate key errors
      const today = new Date();
      const year = today.getFullYear().toString().substr(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const randomNum = (Math.floor(Math.random() * 1000) + i + 1).toString().padStart(3, '0');
      const billingId = `BILL-${year}${month}${day}-${randomNum}`;
      
      billingData.push({
        billingId: billingId,
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorId: doctor._id,
        doctorName: doctorName,
        services: services,
        totalAmount: totalAmount,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: 'Generated test data',
        issueDate: date,
        dueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
        paidDate: paymentStatus === 'paid' ? new Date(date.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000) : null
      });
    }
    
    return billingData;
  } catch (error) {
    console.error('Error generating billing data:', error);
    throw error;
  }
};

const seedBillingData = async () => {
  try {
    // Clear existing billing data
    await Billing.deleteMany({});
    console.log('Cleared existing billing data');
    
    // Generate and insert new billing data
    const billingData = await generateBillingData();
    
    if (billingData.length === 0) {
      console.log('No billing data was generated. Please check patients and doctors in the database.');
      throw new Error('No billing data generated');
    }
    
    const result = await Billing.insertMany(billingData);
    
    console.log(`Successfully seeded ${result.length} billing records`);
    return result;
  } catch (error) {
    console.error('Error seeding billing data:', error);
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
      await seedBillingData();
      console.log('Billing data seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = seedBillingData; 