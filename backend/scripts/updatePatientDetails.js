const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

// Update patients with additional information
const updatePatientsWithAdditionalInfo = async () => {
  try {
    console.log('Updating patients with additional information...');
    
    // Get all patients
    const patients = await Patient.find();
    console.log(`Found ${patients.length} patients to update`);
    
    if (patients.length === 0) {
      console.log('No patients found to update');
      return;
    }
    
    // Sample diagnosis data for each patient
    const diagnosisData = [
      {
        diagnosisDate: new Date('2023-12-15'),
        chiefComplaint: 'Persistent cough and fever',
        diagnosisNotes: 'Patient presents with symptoms of upper respiratory infection. Lungs clear on auscultation. No signs of pneumonia.',
        treatmentPlan: 'Prescribed antibiotics for 7 days. Recommended rest and increased fluid intake.',
        followUpDate: new Date('2024-01-05')
      },
      {
        diagnosisDate: new Date('2023-10-22'),
        chiefComplaint: 'Lower back pain for 2 weeks',
        diagnosisNotes: 'Mechanical lower back pain. No radiating pain to legs. Normal neurological exam.',
        treatmentPlan: 'Physical therapy twice weekly for 4 weeks. NSAIDs for pain management.',
        followUpDate: new Date('2023-11-20')
      },
      {
        diagnosisDate: new Date('2024-02-08'),
        chiefComplaint: 'Headaches and dizziness',
        diagnosisNotes: 'Tension headaches likely related to stress. No focal neurological findings.',
        treatmentPlan: 'Stress management techniques and muscle relaxants as needed.',
        followUpDate: new Date('2024-03-01')
      },
      {
        diagnosisDate: new Date('2024-01-30'),
        chiefComplaint: 'Joint pain in knees and fingers',
        diagnosisNotes: 'Early signs of osteoarthritis. X-rays show minimal joint space narrowing.',
        treatmentPlan: 'Acetaminophen for pain. Recommended joint-friendly exercises and weight management.',
        followUpDate: new Date('2024-04-15')
      },
      {
        diagnosisDate: new Date('2024-03-12'),
        chiefComplaint: 'Skin rash on arms and torso',
        diagnosisNotes: 'Contact dermatitis. Likely reaction to new laundry detergent.',
        treatmentPlan: 'Topical corticosteroid cream. Advised to switch to hypoallergenic products.',
        followUpDate: new Date('2024-03-26')
      }
    ];
    
    // Sample guarantor information
    const guarantorData = [
      {
        guarantorName: 'Jane Doe',
        guarantorRelation: 'Spouse',
        guarantorPhone: '+1-555-987-6543',
        guarantorAddress: '123 Main St, Anytown, USA'
      },
      {
        guarantorName: 'Michael Johnson',
        guarantorRelation: 'Father',
        guarantorPhone: '+1-555-234-5678',
        guarantorAddress: '456 Oak St, Somewhere, USA'
      },
      {
        guarantorName: 'Sarah Rodriguez',
        guarantorRelation: 'Sister',
        guarantorPhone: '+1-555-876-5432',
        guarantorAddress: '789 Pine Ave, Elsewhere, USA'
      },
      {
        guarantorName: 'David Wilson',
        guarantorRelation: 'Brother',
        guarantorPhone: '+1-555-345-6789',
        guarantorAddress: '321 Maple Dr, Anywhere, USA'
      },
      {
        guarantorName: 'Lisa Chen',
        guarantorRelation: 'Daughter',
        guarantorPhone: '+1-555-654-3210',
        guarantorAddress: '654 Cedar Ln, Someplace, USA'
      }
    ];
    
    // Sample insurance information
    const insuranceData = [
      {
        insuranceProvider: 'Blue Cross Blue Shield',
        policyNumber: 'BCBS-12345678',
        groupNumber: 'GRP-9876',
        effectiveDate: new Date('2023-01-01'),
        expiryDate: new Date('2023-12-31')
      },
      {
        insuranceProvider: 'Aetna',
        policyNumber: 'AET-87654321',
        groupNumber: 'GRP-5432',
        effectiveDate: new Date('2023-03-15'),
        expiryDate: new Date('2024-03-14')
      },
      {
        insuranceProvider: 'UnitedHealthcare',
        policyNumber: 'UHC-23456789',
        groupNumber: 'GRP-6789',
        effectiveDate: new Date('2023-06-01'),
        expiryDate: new Date('2024-05-31')
      },
      {
        insuranceProvider: 'Cigna',
        policyNumber: 'CIG-34567890',
        groupNumber: 'GRP-1234',
        effectiveDate: new Date('2023-09-01'),
        expiryDate: new Date('2024-08-31')
      },
      {
        insuranceProvider: 'Humana',
        policyNumber: 'HUM-45678901',
        groupNumber: 'GRP-5678',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2024-12-31')
      }
    ];
    
    // Sample emergency contact information
    const emergencyContactData = [
      {
        emergencyContactName: 'Robert Johnson',
        emergencyContactRelation: 'Brother',
        emergencyContactPhone: '+1-555-123-4567',
        emergencyContactAddress: '789 Elm St, Anytown, USA'
      },
      {
        emergencyContactName: 'Maria Garcia',
        emergencyContactRelation: 'Mother',
        emergencyContactPhone: '+1-555-234-5678',
        emergencyContactAddress: '456 Birch Ave, Somewhere, USA'
      },
      {
        emergencyContactName: 'Thomas Wilson',
        emergencyContactRelation: 'Father',
        emergencyContactPhone: '+1-555-345-6789',
        emergencyContactAddress: '123 Spruce Dr, Elsewhere, USA'
      },
      {
        emergencyContactName: 'Jennifer Brown',
        emergencyContactRelation: 'Spouse',
        emergencyContactPhone: '+1-555-456-7890',
        emergencyContactAddress: '321 Oak Ln, Anywhere, USA'
      },
      {
        emergencyContactName: 'Alex Chen',
        emergencyContactRelation: 'Sibling',
        emergencyContactPhone: '+1-555-567-8901',
        emergencyContactAddress: '654 Pine St, Someplace, USA'
      }
    ];
    
    // Update each patient with additional information
    let updatedCount = 0;
    for (const patient of patients) {
      // Select random data index
      const randomIndex = Math.floor(Math.random() * 5);
      
      // Create update object with all additional information
      const updateData = {
        // Diagnosis information
        ...diagnosisData[randomIndex],
        
        // Guarantor information
        ...guarantorData[randomIndex],
        
        // Insurance information
        ...insuranceData[randomIndex],
        
        // Emergency contact information
        ...emergencyContactData[randomIndex]
      };
      
      // Update patient
      await Patient.updateOne({ _id: patient._id }, { $set: updateData });
      updatedCount++;
      
      console.log(`Updated patient: ${patient.firstName} ${patient.lastName}`);
    }
    
    console.log(`Successfully updated ${updatedCount} patients with additional information`);
    return updatedCount;
  } catch (error) {
    console.error('Error updating patients:', error);
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
      await updatePatientsWithAdditionalInfo();
      console.log('Patient details updated successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = updatePatientsWithAdditionalInfo; 