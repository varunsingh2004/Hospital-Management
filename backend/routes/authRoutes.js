const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerUser, loginUser, getUserProfile, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/auth/health
// @desc    Health check for API
// @access  Public
router.get('/health', (req, res) => {
  // Add cache control headers to prevent frequent calls
  res.set('Cache-Control', 'public, max-age=60'); // Cache for 60 seconds
  res.status(200).json({ status: 'ok', message: 'Auth API is running', timestamp: new Date().toISOString() });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  ],
  registerUser
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   GET /api/auth/verify
// @desc    Verify token and get user data
// @access  Private
router.get('/verify', protect, verifyToken);

module.exports = router; 