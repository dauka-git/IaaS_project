const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const verificationCodes = {}; // In-memory store (use Redis/db for production)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your app password
  }
});

router.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`
    });
    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] === code) {
    delete verificationCodes[email];
    res.json({ valid: true });
  } else {
    res.status(400).json({ valid: false, message: 'Invalid code' });
  }
});

module.exports = router; 