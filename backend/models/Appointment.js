const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
    },
    patient: {
      patientId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phoneNumber: String,
      email: String
    },
    doctor: {
      doctorId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      }
    },
    department: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // Format: "HH:MM" in 24-hour format
      required: true,
    },
    endTime: {
      type: String, // Format: "HH:MM" in 24-hour format
      required: true,
    },
    duration: {
      type: Number, // In minutes
      default: 30,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Auto-generate Appointment ID
AppointmentSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  // If appointmentId already exists and is not empty, don't generate a new one
  if (this.appointmentId && this.appointmentId.trim() !== '') {
    return next();
  }

  try {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Find the count of appointments created today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });

    // Format: APT-YYMMDD-XXX where XXX is a sequential number
    this.appointmentId = `APT-${year}${month}${day}-${(count + 1).toString().padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema); 