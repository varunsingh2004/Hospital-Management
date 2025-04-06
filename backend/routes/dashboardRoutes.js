const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', auth, dashboardController.getDashboardStats);

// @route   GET /api/dashboard/appointments-by-department
// @desc    Get appointments by department
// @access  Private
router.get('/appointments-by-department', auth, dashboardController.getAppointmentsByDepartment);

// @route   GET /api/dashboard/revenue
// @desc    Get revenue data
// @access  Private
router.get('/revenue', auth, dashboardController.getRevenueData);

// @route   GET /api/dashboard/patient-age-distribution
// @desc    Get patient age distribution
// @access  Private
router.get('/patient-age-distribution', auth, dashboardController.getPatientAgeDistribution);

// @route   GET /api/dashboard/recent-patients
// @desc    Get recent patients
// @access  Private
router.get('/recent-patients', auth, dashboardController.getRecentPatients);

// @route   GET /api/dashboard/all
// @desc    Get all dashboard data
// @access  Private
router.get('/all', auth, dashboardController.getAllDashboardData);

module.exports = router; 