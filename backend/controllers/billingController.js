const { validationResult } = require('express-validator');
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create new billing record
// @route   POST /api/billing
// @access  Private
const createBilling = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create 30 days due date by default
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Calculate total amount if not provided
    let totalAmount = req.body.totalAmount;
    if (!totalAmount && req.body.services && req.body.services.length > 0) {
      totalAmount = req.body.services.reduce((total, service) => total + (service.price * (service.quantity || 1)), 0);
    }

    const newBilling = new Billing({
      ...req.body,
      totalAmount,
      dueDate: req.body.dueDate || dueDate,
      issueDate: req.body.issueDate || new Date()
    });

    const billing = await newBilling.save();
    res.status(201).json(billing);
  } catch (err) {
    console.error('Error creating billing record:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all billing records with optional filtering
// @route   GET /api/billing
// @access  Private
const getBillings = async (req, res) => {
  try {
    const { 
      patientId,
      patientFilter,
      doctorFilter, 
      doctorId, 
      paymentStatus, 
      startDate, 
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Handle direct ID filters if provided
    if (patientId) filter.patientId = patientId;
    
    // If doctorId is provided, use it directly
    if (doctorId) {
      try {
        // First check if it's a valid ObjectId
        const mongoose = require('mongoose');
        const objectId = new mongoose.Types.ObjectId(doctorId);
        
        // Try to find the doctor in the doctors collection
        const doctor = await Doctor.findById(objectId);
        
        if (doctor) {
          // If found, we can filter billing records by this doctor's ID
          filter.doctorId = objectId;
          console.log(`Found doctor: ${doctor.firstName} ${doctor.lastName}, filtering by ID`);
        } else {
          console.log(`No doctor found with ID: ${doctorId}`);
          // Return empty result if doctor doesn't exist
          return res.json([]);
        }
      } catch (err) {
        console.error("Invalid doctor ID format:", doctorId, err);
        // If it's not a valid ObjectId, return empty result
        return res.json([]);
      }
    }
    
    // Handle the flexible patient filtering (by name primarily, but also match potential ObjectIDs)
    if (patientFilter) {
      if (!filter.$or) filter.$or = [];
      
      // Always search by name
      filter.$or.push({ patientName: { $regex: patientFilter, $options: 'i' } });
      
      // If the filter could be a valid ObjectId, add that condition
      if (patientFilter.length === 24 && /^[0-9a-fA-F]{24}$/.test(patientFilter)) {
        const mongoose = require('mongoose');
        try {
          const objectId = new mongoose.Types.ObjectId(patientFilter);
          
          // Try to find the patient first
          const patient = await Patient.findById(objectId);
          if (patient) {
            filter.$or.push({ patientId: objectId });
            console.log(`Found patient: ${patient.firstName} ${patient.lastName}, adding to filters`);
          }
        } catch (err) {
          // Not a valid ObjectId, that's ok, just skip this condition
          console.log("Not a valid ObjectId for patient:", patientFilter);
        }
      }
      
      // Also search by billingId which is a string
      filter.$or.push({ billingId: { $regex: patientFilter, $options: 'i' } });
    }

    // Handle the flexible doctor filtering (by name primarily, but also match potential ObjectIDs)
    if (doctorFilter) {
      if (!filter.$or) filter.$or = [];
      
      // Always search by name
      filter.$or.push({ doctorName: { $regex: doctorFilter, $options: 'i' } });
      
      // If the filter could be a valid ObjectId, add that condition
      if (doctorFilter.length === 24 && /^[0-9a-fA-F]{24}$/.test(doctorFilter)) {
        const mongoose = require('mongoose');
        try {
          const objectId = new mongoose.Types.ObjectId(doctorFilter);
          
          // Try to find the doctor first to confirm it exists
          const doctor = await Doctor.findById(objectId);
          if (doctor) {
            filter.$or.push({ doctorId: objectId });
            console.log(`Found doctor: ${doctor.firstName} ${doctor.lastName}, adding to filters`);
          }
        } catch (err) {
          // Not a valid ObjectId, that's ok, just skip this condition
          console.log("Not a valid ObjectId for doctor:", doctorFilter);
        }
      } else {
        // If it's not an ObjectId format, also try to find doctors by name
        const doctors = await Doctor.find({
          $or: [
            { firstName: { $regex: doctorFilter, $options: 'i' } },
            { lastName: { $regex: doctorFilter, $options: 'i' } }
          ]
        });
        
        if (doctors.length > 0) {
          // If doctors found, add their IDs to the OR conditions
          const doctorIds = doctors.map(doctor => doctor._id);
          filter.$or.push({ doctorId: { $in: doctorIds } });
          console.log(`Found ${doctors.length} doctors by name, adding their IDs to filters`);
        }
      }
    }
    
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    // Date range filter
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = Number(minAmount);
      if (maxAmount) filter.totalAmount.$lte = Number(maxAmount);
    }

    console.log('Filtering with:', filter);
    const billings = await Billing.find(filter).sort({ issueDate: -1 });
    
    res.json(billings);
  } catch (err) {
    console.error('Error fetching billing records:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get billing record by ID
// @route   GET /api/billing/:id
// @access  Private
const getBillingById = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);
    
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    res.json(billing);
  } catch (err) {
    console.error('Error fetching billing record:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update billing record
// @route   PUT /api/billing/:id
// @access  Private
const updateBilling = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let billing = await Billing.findById(req.params.id);
    
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    // Update billing fields
    const updateData = req.body;
    
    // Calculate total amount if services are being updated
    if (updateData.services && updateData.services.length > 0) {
      updateData.totalAmount = updateData.services.reduce((total, service) => total + (service.price * (service.quantity || 1)), 0);
    }
    
    // Update with new values
    billing = await Billing.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(billing);
  } catch (err) {
    console.error('Error updating billing record:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete billing record
// @route   DELETE /api/billing/:id
// @access  Private
const deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);
    
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    await billing.remove();
    
    res.json({ message: 'Billing record removed' });
  } catch (err) {
    console.error('Error deleting billing record:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update payment status of billing
// @route   PATCH /api/billing/:id/payment
// @access  Private
const updatePaymentStatus = async (req, res) => {
  const { paymentStatus, paymentMethod, notes } = req.body;
  
  if (!paymentStatus && !paymentMethod) {
    return res.status(400).json({ message: 'No payment update provided' });
  }

  try {
    const billing = await Billing.findById(req.params.id);
    
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    
    // Update fields if provided
    if (paymentStatus) billing.paymentStatus = paymentStatus;
    if (paymentMethod) billing.paymentMethod = paymentMethod;
    if (notes) billing.notes = notes;
    
    // Set paidDate if status is paid and paidDate is not already set
    if (paymentStatus === 'paid' && !billing.paidDate) {
      billing.paidDate = new Date();
    }
    
    await billing.save();
    
    res.json(billing);
  } catch (err) {
    console.error('Error updating payment status:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get billing summary statistics
// @route   GET /api/billing/summary
// @access  Private
const getBillingSummary = async (req, res) => {
  try {
    // Get all billings for simplicity in the demo (in production, this would be optimized with aggregation)
    const billings = await Billing.find();
    
    // Calculate summary stats
    const totalAmount = billings.reduce((sum, billing) => sum + billing.totalAmount, 0);
    const totalPaid = billings.filter(b => b.paymentStatus === 'paid').reduce((sum, billing) => sum + billing.totalAmount, 0);
    const totalPending = billings.filter(b => b.paymentStatus === 'pending').reduce((sum, billing) => sum + billing.totalAmount, 0);
    const totalOverdue = billings.filter(b => b.paymentStatus === 'overdue').reduce((sum, billing) => sum + billing.totalAmount, 0);
    
    // Group by payment status
    const paymentStatusCounts = {
      paid: billings.filter(b => b.paymentStatus === 'paid').length,
      pending: billings.filter(b => b.paymentStatus === 'pending').length,
      overdue: billings.filter(b => b.paymentStatus === 'overdue').length,
      cancelled: billings.filter(b => b.paymentStatus === 'cancelled').length
    };
    
    // Payment method distribution
    const paymentMethodCounts = {};
    billings.forEach(billing => {
      if (billing.paymentMethod) {
        paymentMethodCounts[billing.paymentMethod] = (paymentMethodCounts[billing.paymentMethod] || 0) + 1;
      }
    });
    
    // Amount by status
    const amountByStatus = {
      paid: totalPaid,
      pending: totalPending,
      overdue: totalOverdue,
      cancelled: billings.filter(b => b.paymentStatus === 'cancelled').reduce((sum, billing) => sum + billing.totalAmount, 0)
    };
    
    // Calculate monthly revenue (last 6 months)
    const monthlyRevenue = {};
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyRevenue[monthKey] = 0;
    }
    
    // Fill in revenue data for each month (using paid billings)
    billings.filter(b => b.paymentStatus === 'paid' && b.paidDate).forEach(billing => {
      const date = new Date(billing.paidDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Only count if it's within our 6-month window
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += billing.totalAmount;
      }
    });
    
    // Format the monthly revenue for chart display
    const formattedMonthlyRevenue = Object.entries(monthlyRevenue).map(([month, amount]) => ({
      month,
      amount
    })).reverse(); // Most recent last
    
    res.json({
      counts: {
        total: billings.length,
        ...paymentStatusCounts
      },
      amounts: {
        total: totalAmount,
        paid: totalPaid,
        pending: totalPending,
        overdue: totalOverdue
      },
      paymentMethods: paymentMethodCounts,
      amountByStatus,
      monthlyRevenue: formattedMonthlyRevenue
    });
  } catch (err) {
    console.error('Error fetching billing summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get billing history for a patient
// @route   GET /api/billing/patient/:patientId
// @access  Private
const getPatientBillingHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Validate patient exists
    const patientExists = await Patient.exists({ _id: patientId });
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get all billings for the patient
    const billings = await Billing.find({ patientId }).sort({ issueDate: -1 });
    
    // Calculate summary statistics
    const totalBilled = billings.reduce((sum, billing) => sum + billing.totalAmount, 0);
    const totalPaid = billings.filter(b => b.paymentStatus === 'paid').reduce((sum, billing) => sum + billing.totalAmount, 0);
    const pendingAmount = billings.filter(b => b.paymentStatus === 'pending' || b.paymentStatus === 'overdue')
      .reduce((sum, billing) => sum + billing.totalAmount, 0);
    
    res.json({
      billings,
      summary: {
        totalBilled,
        totalPaid,
        pendingAmount,
        billCount: billings.length
      }
    });
  } catch (err) {
    console.error('Error fetching patient billing history:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid patient ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  deleteBilling,
  updatePaymentStatus,
  getBillingSummary,
  getPatientBillingHistory
}; 