const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    salutation: {
      type: String,
      enum: ['Mr', 'Ms', 'Mrs'],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    landlineNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    membershipType: {
      type: String,
      enum: ['General (0%)', 'Gold (10%)', 'Platinum (15%)', 'Diamond (20%)'],
      default: 'General (0%)',
      required: true,
    },
    caste: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      enum: ['Married', 'Unmarried', ''],
      default: '',
    },
    panNumber: {
      type: String,
      trim: true,
    },
    employerInfo: {
      type: String,
      trim: true,
    },
    previousLastName: {
      type: String,
      trim: true,
    },
    notifications: {
      type: Boolean,
      default: false,
    },
    
    // Diagnosis Information
    diagnosisDate: {
      type: Date,
    },
    chiefComplaint: {
      type: String,
      trim: true,
    },
    diagnosisNotes: {
      type: String,
      trim: true,
    },
    assignedDoctor: {
      type: String,
      trim: true,
    },
    treatmentPlan: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    
    // Guarantor Information
    guarantorName: {
      type: String,
      trim: true,
    },
    guarantorRelation: {
      type: String,
      trim: true,
    },
    guarantorPhone: {
      type: String,
      trim: true,
    },
    guarantorAddress: {
      type: String,
      trim: true,
    },
    
    // Insurance Information
    insuranceProvider: {
      type: String,
      trim: true,
    },
    policyNumber: {
      type: String,
      trim: true,
    },
    groupNumber: {
      type: String,
      trim: true,
    },
    effectiveDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    
    // Emergency Contact
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactRelation: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    emergencyContactAddress: {
      type: String,
      trim: true,
    },
    
    // System fields
    patientId: {
      type: String,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate Patient ID
PatientSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Find the count of patients registered in this month
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      },
    });

    // Format: P-YY-MM-XXXX where XXXX is a sequential number
    this.patientId = `P-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Patient', PatientSchema); 