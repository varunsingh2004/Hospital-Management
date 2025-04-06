const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const billingController = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/billing
// @desc    Create a new billing record
// @access  Private
router.post(
  '/',
  protect,
  [
    check('patientId', 'Patient ID is required').not().isEmpty(),
    check('patientName', 'Patient name is required').not().isEmpty(),
    check('doctorId', 'Doctor ID is required').not().isEmpty(),
    check('doctorName', 'Doctor name is required').not().isEmpty(),
    check('services', 'Services are required').isArray({ min: 1 }),
    check('services.*.name', 'Service name is required').not().isEmpty(),
    check('services.*.price', 'Service price is required').isNumeric(),
  ],
  billingController.createBilling
);

// @route   GET /api/billing
// @desc    Get all billing records with optional filtering
// @access  Private
router.get('/', protect, billingController.getBillings);

// @route   GET /api/billing/summary
// @desc    Get billing summary statistics
// @access  Private
router.get('/summary', protect, billingController.getBillingSummary);

// @route   GET /api/billing/patient/:patientId
// @desc    Get patient billing history
// @access  Private
router.get('/patient/:patientId', protect, billingController.getPatientBillingHistory);

// @route   GET /api/billing/:id
// @desc    Get billing record by ID
// @access  Private
router.get('/:id', protect, billingController.getBillingById);

// @route   PUT /api/billing/:id
// @desc    Update billing record
// @access  Private
router.put(
  '/:id',
  protect,
  [
    check('patientId', 'Patient ID is required').optional().not().isEmpty(),
    check('patientName', 'Patient name is required').optional().not().isEmpty(),
    check('doctorId', 'Doctor ID is required').optional().not().isEmpty(),
    check('doctorName', 'Doctor name is required').optional().not().isEmpty(),
    check('services', 'Services must be an array').optional().isArray(),
    check('services.*.name', 'Service name is required').optional().not().isEmpty(),
    check('services.*.price', 'Service price is required').optional().isNumeric(),
    check('paymentStatus', 'Payment status must be valid').optional().isIn(['paid', 'pending', 'overdue', 'cancelled']),
    check('paymentMethod', 'Payment method must be valid').optional().isIn(['cash', 'credit card', 'debit card', 'insurance', 'bank transfer', 'check', 'other']),
  ],
  billingController.updateBilling
);

// @route   PATCH /api/billing/:id/payment
// @desc    Update payment status of a billing
// @access  Private
router.patch(
  '/:id/payment',
  protect,
  [
    check('paymentStatus', 'Payment status must be valid').optional().isIn(['paid', 'pending', 'overdue', 'cancelled']),
    check('paymentMethod', 'Payment method must be valid').optional().isIn(['cash', 'credit card', 'debit card', 'insurance', 'bank transfer', 'check', 'other']),
  ],
  billingController.updatePaymentStatus
);

// @route   DELETE /api/billing/:id
// @desc    Delete billing record
// @access  Private
router.delete('/:id', protect, billingController.deleteBilling);

module.exports = router; 