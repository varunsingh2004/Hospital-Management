const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    reportDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    symptoms: {
      type: String,
      required: true
    },
    diagnosis: {
      type: String,
      required: true
    },
    tests: [
      {
        name: {
          type: String,
          required: true
        },
        result: {
          type: String
        },
        date: {
          type: Date
        },
        status: {
          type: String,
          enum: ['ordered', 'in-progress', 'completed'],
          default: 'ordered'
        },
        notes: {
          type: String
        }
      }
    ],
    medications: [
      {
        name: {
          type: String,
          required: true
        },
        dosage: {
          type: String,
          required: true
        },
        frequency: {
          type: String,
          required: true
        },
        duration: {
          type: String,
          required: true
        },
        notes: {
          type: String
        }
      }
    ],
    vitalSigns: {
      temperature: Number,
      bloodPressure: String,
      heartRate: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      height: Number,
      weight: Number
    },
    treatment: {
      type: String
    },
    recommendations: {
      type: String
    },
    followUpDate: {
      type: Date
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      enum: ['draft', 'final', 'amended'],
      default: 'draft'
    }
  },
  {
    timestamps: true,
  }
);

// Auto-generate Report ID
ReportSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  // If reportId already exists and is not empty, don't generate a new one
  if (this.reportId && this.reportId.trim() !== '') {
    return next();
  }

  try {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Find the count of reports created today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });

    // Format: REP-YYMMDD-XXX where XXX is a sequential number
    this.reportId = `REP-${year}${month}${day}-${(count + 1).toString().padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Report', ReportSchema); 