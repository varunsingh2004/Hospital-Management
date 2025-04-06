const express = require('express');
const router = express.Router();
const { 
  registerDoctor, 
  getDoctors, 
  getDoctorById, 
  updateDoctor, 
  deleteDoctor,
  searchDoctors
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/doctors/search
// @access  Private
router.get('/search', protect, searchDoctors);

// @route   GET /api/doctors
// @access  Private
router.get('/', protect, getDoctors);

// @route   GET /api/doctors/:id
// @access  Private
router.get('/:id', protect, getDoctorById);

// @route   POST /api/doctors
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), registerDoctor);

// @route   PUT /api/doctors/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), updateDoctor);

// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;