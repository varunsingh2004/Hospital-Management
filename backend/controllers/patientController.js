const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private
exports.registerPatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add the user who registered this patient
    const patientData = {
      ...req.body,
      registeredBy: req.user.id
    };

    // Create patient
    const patient = await Patient.create(patientData);
    
    res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
exports.searchPatients = async (req, res) => {
  try {
    const {
      patientId,
      name,
      phoneNumber,
      dateRange,
      startDate,
      endDate
    } = req.query;

    // Build search query
    const query = {};

    // Search by patientId
    if (patientId) {
      query.patientId = { $regex: patientId, $options: 'i' };
    }

    // Search by name (first or last)
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } },
        { middleName: { $regex: name, $options: 'i' } }
      ];
    }

    // Search by phone number
    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }

    // Search by date range
    if (dateRange || startDate || endDate) {
      query.createdAt = {};

      if (dateRange === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.createdAt.$gte = today;
      } else if (dateRange === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        query.createdAt.$gte = yesterday;
        query.createdAt.$lt = today;
      } else if (dateRange === 'lastWeek') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        query.createdAt.$gte = lastWeek;
      } else if (dateRange === 'lastMonth') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        query.createdAt.$gte = lastMonth;
      } else if (startDate || endDate) {
        // Custom date range
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          query.createdAt.$gte = start;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update patient fields
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedPatient);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin or Doctor)
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    await patient.remove();
    
    res.json({ message: 'Patient removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}; 