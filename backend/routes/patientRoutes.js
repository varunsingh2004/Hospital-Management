const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// @route   POST /api/patients
// @desc    Register a new patient
// @access  Private
router.post(
  '/',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('dateOfBirth', 'Date of birth is required').not().isEmpty(),
    check('age', 'Age is required').isNumeric(),
    check('gender', 'Gender is required').isIn(['Male', 'Female', 'Other']),
    check('phoneNumber', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('state', 'State is required').not().isEmpty(),
  ],
  registerPatient
);

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private
router.get('/', getPatients);

// @route   GET /api/patients/search
// @desc    Search patients
// @access  Private
router.get('/search', searchPatients);

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', getPatientById);

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private
router.put('/:id', updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private (Admin or Doctor)
router.delete('/:id', authorize('admin', 'doctor'), deletePatient);

module.exports = router; 