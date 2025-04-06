const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema(
  {
    billingId: {
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
    services: [
      {
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit card', 'debit card', 'insurance', 'bank transfer', 'check', 'other'],
      default: 'cash',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

// Auto-generate Billing ID
BillingSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  // If billingId already exists and is not empty, don't generate a new one
  if (this.billingId && this.billingId.trim() !== '') {
    return next();
  }

  try {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Find the count of billings created today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });

    // Format: BILL-YYMMDD-XXX where XXX is a sequential number
    this.billingId = `BILL-${year}${month}${day}-${(count + 1).toString().padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Billing', BillingSchema); 