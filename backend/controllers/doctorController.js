const Doctor = require('../models/Doctor');
const { validationResult } = require('express-validator');

// @desc    Register a new doctor
// @route   POST /api/doctors
// @access  Private (Admin only)
exports.registerDoctor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Add the user who created this doctor record
    const doctorData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Create doctor
    const doctor = await Doctor.create(doctorData);
    
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin only)
exports.updateDoctor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Update doctor fields
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    await Doctor.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search doctors
// @route   GET /api/doctors/search
// @access  Private
exports.searchDoctors = async (req, res) => {
  try {
    const {
      name,
      department,
      specialization,
      status
    } = req.query;

    // Build search query
    const query = {};

    // Search by name (first or last)
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    // Search by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Search by specialization
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Search by status
    if (status) {
      query.status = status;
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 