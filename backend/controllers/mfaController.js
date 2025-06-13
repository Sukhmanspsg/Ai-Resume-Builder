const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Generate MFA secret and QR code
const setupMFA = async (req, res) => {
  try {
    // Get user ID from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'mfa_setup') {
      return res.status(401).json({ message: 'Invalid token purpose' });
    }

    const userId = decoded.id;

    // Generate a secret key
    const secret = speakeasy.generateSecret({
      name: 'ResumePro',
      issuer: 'ResumePro'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily in the database
    const query = 'UPDATE users SET mfa_secret = ?, mfa_enabled = false WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.query(query, [secret.base32, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({
      message: 'MFA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ message: 'Error setting up MFA' });
  }
};

// Verify and enable MFA
const verifyAndEnableMFA = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Get user ID from token
    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'mfa_setup') {
      return res.status(401).json({ message: 'Invalid token purpose' });
    }

    const userId = decoded.id;

    // Get user's secret from database
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT mfa_secret FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 30 seconds clock skew
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }

    // Enable MFA for the user
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET mfa_enabled = true WHERE id = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ message: 'Error verifying MFA' });
  }
};

// Verify MFA token (used during login)
const verifyMFAToken = async (req, res) => {
  try {
    const { token, userId } = req.body;

    // Get user's secret from database
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT mfa_secret FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }

    // ✅ NEW: Generate a JWT token after successful MFA
    const jwtToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'MFA token verified',
      verified: true,
      token: jwtToken // 🟢 You’ll use this for Authorization header
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ message: 'Error verifying MFA token' });
  }
};


// Disable MFA
const disableMFA = async (req, res) => {
  try {
    const { userId } = req.user;

    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET mfa_enabled = false, mfa_secret = NULL WHERE id = ?', [userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ message: 'Error disabling MFA' });
  }
};

module.exports = {
  setupMFA,
  verifyAndEnableMFA,
  verifyMFAToken,
  disableMFA
}; 