const express = require('express');
const router = express.Router();

// Import authentication controller
const authController = require('../controllers/authController');

// ===============================================
// @route   POST /api/auth/register
// @desc    Register a new user and send activation email
// @access  Public
// ===============================================
router.post('/register', authController.register);

// ===============================================
// @route   POST /api/auth/login
// @desc    Login user and return JWT if verified
// @access  Public
// ===============================================
router.post('/login', authController.login);

// ===============================================
// @route   GET /api/auth/activate/:token
// @desc    Activate user account using token from email
// @access  Public
// ===============================================
router.get('/activate/:token', authController.activateAccount);

// ===============================================
// @route   POST /api/auth/resend-activation
// @desc    Resend activation email if account not verified
// @access  Public
// ===============================================
router.post('/resend-activation', authController.resendActivationEmail);

// Export router for use in main server file
module.exports = router;
