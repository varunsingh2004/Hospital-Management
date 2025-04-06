const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create new medical report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create new report
    const newReport = new Report({
      ...req.body,
      reportDate: req.body.reportDate || new Date()
    });

    const report = await newReport.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('Error creating medical report:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all medical reports with optional filtering
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const { 
      patientId,
      patientFilter,
      doctorId,
      doctorFilter, 
      startDate, 
      endDate,
      diagnosisFilter,
      status
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
          // If found, we can filter reports by this doctor's ID
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
      
      // Also search by reportId which is a string
      filter.$or.push({ reportId: { $regex: patientFilter, $options: 'i' } });
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
    
    // Date range filter for reportDate
    if (startDate || endDate) {
      filter.reportDate = {};
      if (startDate) filter.reportDate.$gte = new Date(startDate);
      if (endDate) filter.reportDate.$lte = new Date(endDate);
    }
    
    // Filter by diagnosis text
    if (diagnosisFilter) {
      filter.diagnosis = { $regex: diagnosisFilter, $options: 'i' };
    }
    
    // Filter by status
    if (status) {
      filter.status = status;
    }

    console.log('Filtering reports with:', filter);
    const reports = await Report.find(filter).sort({ reportDate: -1 });
    
    res.json(reports);
  } catch (err) {
    console.error('Error fetching medical reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    res.json(report);
  } catch (err) {
    console.error('Error fetching medical report:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    // Update report fields
    const updateData = req.body;
    
    // Update with new values
    report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(report);
  } catch (err) {
    console.error('Error updating medical report:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    await Report.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Medical report removed' });
  } catch (err) {
    console.error('Error deleting medical report:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient reports history
// @route   GET /api/reports/patient/:patientId
// @access  Private
const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Validate patient exists
    const patientExists = await Patient.exists({ _id: patientId });
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get all reports for the patient
    const reports = await Report.find({ patientId }).sort({ reportDate: -1 });
    
    res.json(reports);
  } catch (err) {
    console.error('Error fetching patient reports:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid patient ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor's reports
// @route   GET /api/reports/doctor/:doctorId
// @access  Private
const getDoctorReports = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Validate doctor exists
    const doctorExists = await Doctor.exists({ _id: doctorId });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get all reports by the doctor
    const reports = await Report.find({ doctorId }).sort({ reportDate: -1 });
    
    res.json(reports);
  } catch (err) {
    console.error('Error fetching doctor reports:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid doctor ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update report status
// @route   PATCH /api/reports/:id/status
// @access  Private
const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    // Update status
    report.status = status;
    
    await report.save();
    
    res.json(report);
  } catch (err) {
    console.error('Error updating report status:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  getPatientReports,
  getDoctorReports,
  updateReportStatus
}; 