const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const mfaController = require('../controllers/mfaController');

// Setup MFA (generates secret and QR code)
router.post('/setup', verifyToken, mfaController.setupMFA);

// Verify and enable MFA
router.post('/verify-setup', verifyToken, mfaController.verifyAndEnableMFA);

// Verify MFA token (during login)
router.post('/verify', mfaController.verifyMFAToken);

// Disable MFA
router.post('/disable', verifyToken, mfaController.disableMFA);

module.exports = router; 