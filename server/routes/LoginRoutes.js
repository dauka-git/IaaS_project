const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const zxcvbn = require('zxcvbn');
const { PhoneNumberUtil } = require('google-libphonenumber');
const validator = require('validator');
const phoneUtil = PhoneNumberUtil.getInstance();
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { bin, email, password, firstName, lastName, company, phone } = req.body;

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    // Phone validation (if provided)
    if (phone) {
      try {
        const number = phoneUtil.parse(phone);
        if (!phoneUtil.isValidNumber(number)) {
          return res.status(400).json({ message: 'Invalid phone number.' });
        }
      } catch {
        return res.status(400).json({ message: 'Invalid phone number.' });
      }
    }

    // Password strength check
    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 2) {
      return res.status(400).json({ message: 'Password is too weak. Please choose a stronger password.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { bin }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or bin already exists' 
      });
    }

    // Create new user
    const user = new User({
      bin,
      email,
      password,
      firstName,
      lastName,
      company,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        bin: user.bin,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        bin: user.bin,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { firstName, lastName, company, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { firstName, lastName, company, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;