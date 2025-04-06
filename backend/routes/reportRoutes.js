const express = require('express');
const { check } = require('express-validator');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reports
// @desc    Create a new medical report
// @access  Private
router.post(
  '/',
  [
    auth,
    check('patientId', 'Patient ID is required').not().isEmpty(),
    check('patientName', 'Patient name is required').not().isEmpty(),
    check('doctorId', 'Doctor ID is required').not().isEmpty(),
    check('doctorName', 'Doctor name is required').not().isEmpty(),
    check('symptoms', 'Symptoms are required').not().isEmpty(),
    check('diagnosis', 'Diagnosis is required').not().isEmpty()
  ],
  reportController.createReport
);

// @route   GET /api/reports
// @desc    Get all medical reports with optional filtering
// @access  Private
router.get('/', auth, reportController.getReports);

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private
router.get('/:id', auth, reportController.getReportById);

// @route   PUT /api/reports/:id
// @desc    Update a report
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('symptoms', 'Symptoms field cannot be empty').optional().notEmpty(),
    check('diagnosis', 'Diagnosis field cannot be empty').optional().notEmpty(),
  ],
  reportController.updateReport
);

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private
router.delete('/:id', auth, reportController.deleteReport);

// @route   GET /api/reports/patient/:patientId
// @desc    Get all reports for a specific patient
// @access  Private
router.get('/patient/:patientId', auth, reportController.getPatientReports);

// @route   GET /api/reports/doctor/:doctorId
// @desc    Get all reports by a specific doctor
// @access  Private
router.get('/doctor/:doctorId', auth, reportController.getDoctorReports);

// @route   PATCH /api/reports/:id/status
// @desc    Update report status
// @access  Private
router.patch(
  '/:id/status',
  [
    auth,
    check('status', 'Status is required').isIn(['draft', 'final', 'amended'])
  ],
  reportController.updateReportStatus
);

module.exports = router; 