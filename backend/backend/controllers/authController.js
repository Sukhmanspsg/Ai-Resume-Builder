const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../models/userModel');
const { sendActivationEmail } = require('../utils/emailService');
const db = require('../config/db');

// ====================================
// REGISTER USER
// ====================================
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  // Step 1: Check if user already exists
  findUserByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

    // Step 2: Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Step 3: Create new user in DB
    createUser(name, email, hashedPassword, async (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to create user', error: err });

      // Step 4: Generate activation token (expires in 10 minutes)
      const token = jwt.sign(
        { email },
        process.env.JWT_ACTIVATE_SECRET,
        { expiresIn: '10m' }
      );

      // Step 5: Send activation email
      try {
        await sendActivationEmail(email, token);
        res.status(201).json({ message: 'User registered. Confirmation email sent.' });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
        res.status(201).json({
          message: 'User registered, but failed to send confirmation email.',
          warning: emailErr.message
        });
      }
    });
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
  const { email, password } = req.body;

  console.log("👉 Received login request for email:", email);
  console.log("👉 Entered password:", password);

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

    console.log("✅ User from DB:", user);
    console.log("🟡 Stored hash in DB:", user.password);

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

    // Step 4: Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log("✅ Login successful. JWT token created for:", email);
    res.status(200).json({ token });
  });
};
