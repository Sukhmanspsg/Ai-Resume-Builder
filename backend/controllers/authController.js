const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../models/userModel');
const { sendActivationEmail } = require('../utils/emailService');
const db = require('../config/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');


// ====================================
// FORGOT PASSWORD
// ====================================
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Step 1: Check if user exists
  findUserByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000; // 1 hour

    // Step 2: Save or update token in DB
    const sql = `
      INSERT INTO reset_tokens (email, token, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
    `;

    db.query(sql, [email, token, expiresAt], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      // Step 3: Send email with reset link
      const resetLink = `http://localhost:3000/reset-password/${token}`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,        // e.g. your Gmail
          pass: process.env.EMAIL_PASS     // stored in .env securely
        }
      });

      const mailOptions = {
        from: 'no-reply@resumebuilder.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>Hello,</p>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link expires in 1 hour.</p>
        `
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('❌ Email failed:', error.message);
          return res.status(500).json({ message: 'Failed to send email' });
        }

        res.status(200).json({ message: 'Reset link sent to your email' });
      });
    });
  });
};
// ====================================
// RESET PASSWORD
// ====================================
exports.resetPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const sql = `SELECT * FROM reset_tokens WHERE token = ? AND expires_at > ?`;
  db.query(sql, [token, Date.now()], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const email = results[0].email;
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Update user's password
    const updateSql = `UPDATE users SET password = ? WHERE email = ?`;
    db.query(updateSql, [hashedPassword, email], (err) => {
      if (err) return res.status(500).json({ message: 'Password reset failed', error: err });

      // Delete token
      db.query(`DELETE FROM reset_tokens WHERE email = ?`, [email], () => {});
      res.status(200).json({ message: 'Password updated successfully' });
    });
  });
};



// ====================================
// REGISTER USER
// ====================================
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Step 1: Check if user already exists
  findUserByEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

    try {
      // Generate MFA secret
      const secret = speakeasy.generateSecret({
        name: `ResumePro (${email})`,
        issuer: 'ResumePro'
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 8);

      // Create new user with MFA secret
      const createUserWithMFA = (name, email, password, mfaSecret) => {
        return new Promise((resolve, reject) => {
          const sql = 'INSERT INTO users (name, email, password, mfa_secret, mfa_enabled) VALUES (?, ?, ?, ?, ?)';
          db.query(sql, [name, email, password, mfaSecret, false], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      };

      const result = await createUserWithMFA(name, email, hashedPassword, secret.base32);

      // Generate activation token
      const token = jwt.sign(
        { email },
        process.env.JWT_ACTIVATE_SECRET,
        { expiresIn: '10m' }
      );

      // Send activation email
      await sendActivationEmail(email, token);

      // Return success with QR code
      res.status(201).json({
        message: 'User registered. Please complete MFA setup and verify your email.',
        qrCode: qrCodeUrl,
        secret: secret.base32,
        userId: result.insertId
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to complete registration', error: error.message });
    }
  });
};

// ====================================
// RESEND ACTIVATION EMAIL
// ====================================
exports.resendActivationEmail = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Step 1: Find user by email
  findUserByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    if (user.verified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Step 2: Generate activation token
    const token = jwt.sign(
      { name: user.name, email: user.email, password: user.password },
      process.env.JWT_ACTIVATE_SECRET,
      { expiresIn: '10m' }
    );

    // Step 3: Send the activation email again
    console.log("Sending email to:", user.email);

    sendActivationEmail(user.email, token)
      .then(() => {
        res.status(200).json({ message: 'Activation email resent' });
      })
      .catch((error) => {
        console.error('Resend email failed:', error);
        res.status(500).json({ message: 'Failed to resend activation email' });
      });
  });
};

// ====================================
// ACTIVATE ACCOUNT
// ====================================
exports.activateAccount = (req, res) => {
  const token = req.params.token;

  // Step 1: Verify the JWT token
  jwt.verify(token, process.env.JWT_ACTIVATE_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ message: 'Invalid or expired token' });

    const { email } = decoded;

    // Step 2: Update user as verified in the database
    const sql = 'UPDATE users SET verified = 1 WHERE email = ?';
    db.query(sql, [email], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to activate account' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Account successfully activated!' });
    });
  });
};

// ====================================
// LOGIN USER
// ====================================
exports.login = (req, res) => {
  const { email, password, mfaToken } = req.body;

  console.log("👉 Received login request for email:", email);

  // Step 1: Look up user by email
  findUserByEmail(email, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: 'Server error', error: err });
    }

    if (results.length === 0) {
      console.log("❌ User not found for email:", email);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    // Step 2: Check if the account is verified
    if (!user.verified) {
      console.log("❌ User is not verified:", email);
      return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }

    // Step 3: Compare password with hashed password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Step 4: Check MFA status
    if (!mfaToken) {
      // Check if user needs to set up MFA
      if (!user.mfa_enabled || !user.mfa_secret) {
        // Generate a temporary token for MFA setup
        const tempToken = jwt.sign(
          { id: user.id, purpose: 'mfa_setup' },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );

        return res.status(400).json({ 
          message: 'MFA setup required',
          requiresMFA: true,
          needsSetup: true,
          userId: user.id,
          tempToken
        });
      }

      return res.status(400).json({ 
        message: 'MFA token required',
        requiresMFA: true,
        userId: user.id 
      });
    }

    // Step 5: Verify MFA token if provided
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: mfaToken,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid MFA token' });
    }

    // Step 6: Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log("✅ Login successful. JWT token created for:", email);
    res.status(200).json({ token });
  });
};

