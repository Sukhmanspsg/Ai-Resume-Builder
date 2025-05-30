const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // 👈 Add this line
    }
  });

// Sends the activation email
const sendActivationEmail = (email, token) => {
  const activationUrl = `http://localhost:3000/activate/${token}`;


  const mailOptions = {
    from: `"AI Resume Builder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Activate Your Account',
    html: `
      <h2>Welcome to AI Resume Builder!</h2>
      <p>Please click the button below to verify your email and activate your account:</p>
      <a href="${activationUrl}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Activate Account</a>
      <p>This link will expire soon. If you did not request this, please ignore this email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

// ✅ NEW: Password reset email function
const sendPasswordResetEmail = (email, token) => {
  const resetUrl = `http://localhost:3000/reset-password/${token}`;
  const mailOptions = {
    from: `"AI Resume Builder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#007BFF;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendActivationEmail, sendPasswordResetEmail };
