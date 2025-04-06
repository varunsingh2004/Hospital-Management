const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private
router.post(
  '/',
  protect,
  [
    check('patient.patientId', 'Patient ID is required').not().isEmpty(),
    check('patient.name', 'Patient name is required').not().isEmpty(),
    check('doctor.doctorId', 'Doctor ID is required').not().isEmpty(),
    check('doctor.name', 'Doctor name is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty(),
    check('appointmentDate', 'Appointment date is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty(),
  ],
  appointmentController.createAppointment
);

// @route   GET /api/appointments
// @desc    Get all appointments with optional filtering
// @access  Private
router.get('/', protect, appointmentController.getAppointments);

// @route   GET /api/appointments/available-slots
// @desc    Get available time slots for a doctor on a given day
// @access  Private
router.get('/available-slots', protect, appointmentController.getAvailableTimeSlots);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', protect, appointmentController.getAppointmentById);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put(
  '/:id',
  protect,
  [
    check('patient.patientId', 'Patient ID is required').optional().not().isEmpty(),
    check('patient.name', 'Patient name is required').optional().not().isEmpty(),
    check('doctor.doctorId', 'Doctor ID is required').optional().not().isEmpty(),
    check('doctor.name', 'Doctor name is required').optional().not().isEmpty(),
    check('department', 'Department is required').optional().not().isEmpty(),
    check('appointmentDate', 'Appointment date is required').optional().not().isEmpty(),
    check('startTime', 'Start time is required').optional().not().isEmpty(),
    check('endTime', 'End time is required').optional().not().isEmpty(),
    check('status', 'Status must be valid').optional().isIn(['Scheduled', 'Completed', 'Cancelled', 'No-Show']),
  ],
  appointmentController.updateAppointment
);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', protect, appointmentController.deleteAppointment);

module.exports = router; 