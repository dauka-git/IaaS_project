const express = require('express');
const IaaSApplication = require('../models/IaaSApplication');
const User = require('../models/User');
const authMiddleware = require('./authMiddleware');
const router = express.Router();

///ex fastapiClient file
const axios = require("axios");

const FASTAPI_BASE_URL = "http://localhost:8000";


// Global counter for FastAPI requests
let fastApiRequestCount = 0;


const callFastAPIAuto = async ({ years, cards_number, cardType, features, starting_number, expected_cards_growth_rate }) => {
  fastApiRequestCount++;
  console.log(`[FastAPI Auto] Request #${fastApiRequestCount}:`, { years, cards_number, cardType, features, starting_number, expected_cards_growth_rate });

  try {
    const res = await axios.post(`${FASTAPI_BASE_URL}/calculate-roi/auto`, {
      years,
      cards_number,
      cardType,
      features: features || [],
      starting_number,
      expected_cards_growth_rate
    });
    return res.data;
  } catch (err) {
    console.error("FastAPI Auto call failed:", err.message);
    throw err;
  }
};

const callFastAPIManual = async ({ explicit_cards_number, cardType, features }) => {
  fastApiRequestCount++;
  console.log(`[FastAPI Manual] Request #${fastApiRequestCount}:`, { explicit_cards_number, cardType, features });

  try {
    const res = await axios.post(`${FASTAPI_BASE_URL}/calculate-roi/manual`, {
      explicit_cards_number,
      cardType,
      features: features || []
    });
    return res.data;
  } catch (err) {
    console.error("FastAPI Manual call failed:", err.message);
    throw err;
  }
};



///---------ROI VALIDATION---------

const validateAutoROIRequest = (body) => {
  const { 
    years, 
    cards_number, 
    cardType, 
    features = [],
    starting_number,
    expected_cards_growth_rate
  } = body;

  const requiredFields = ['years', 'cards_number', 'cardType', 'starting_number', 'expected_cards_growth_rate'];

  const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  const parsedYears = Number(years);
  if (!Number.isInteger(parsedYears) || parsedYears <= 0) {
    return { 
      valid: false, 
      error: "Invalid 'years'. Must be a positive integer." 
    };
  }

  const parsedCardsNumber = Number(cards_number);
  if (!Number.isInteger(parsedCardsNumber) || parsedCardsNumber <= 0) {
    return { 
      valid: false, 
      error: "Invalid 'cards_number'. Must be a positive integer." 
    };
  }

  const parsedStartingNumber = Number(starting_number);
  if (!Number.isInteger(parsedStartingNumber) || parsedStartingNumber <= 0) {
    return { 
      valid: false, 
      error: "Invalid 'starting_number'. Must be a positive integer." 
    };
  }

  const parsedGrowthRate = Number(expected_cards_growth_rate);
  if (isNaN(parsedGrowthRate) || parsedGrowthRate <= 0) {
    return { 
      valid: false, 
      error: "Invalid 'expected_cards_growth_rate'. Must be a positive number." 
    };
  }

  if (typeof cardType !== 'string' || cardType.trim() === '') {
    return { 
      valid: false, 
      error: "Invalid 'cardType'. Must be a non-empty string." 
    };
  }

  if (!Array.isArray(features)) {
    return { 
      valid: false, 
      error: "Invalid 'features'. Must be an array." 
    };
  }

  return {
    valid: true,
    data: {
      years: parsedYears,
      cards_number: parsedCardsNumber,
      cardType: cardType.trim(),
      features: features.filter(f => typeof f === 'string'),
      starting_number: parsedStartingNumber,
      expected_cards_growth_rate: parsedGrowthRate
    }
  };
};

const validateManualROIRequest = (body) => {
  const { 
    explicit_cards_number, 
    cardType, 
    features = [] 
  } = body;

  const requiredFields = ['explicit_cards_number', 'cardType'];
  const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  if (typeof explicit_cards_number !== 'object' || Array.isArray(explicit_cards_number)) {
    return { 
      valid: false, 
      error: "Invalid 'explicit_cards_number'. Must be an object with year keys." 
    };
  }

  // Validate explicit_cards_number object
  const validatedCardsNumber = {};
  for (const [year, count] of Object.entries(explicit_cards_number)) {
    const yearNum = Number(year);
    const countNum = Number(count);
    
    if (!Number.isInteger(yearNum) || yearNum <= 0) {
      return { 
        valid: false, 
        error: `Invalid year '${year}'. Must be a positive integer.` 
      };
    }
    
    if (!Number.isInteger(countNum) || countNum < 0) {
      return { 
        valid: false, 
        error: `Invalid card count '${count}' for year ${year}. Must be a non-negative integer.` 
      };
    }
    
    validatedCardsNumber[yearNum] = countNum;
  }

  if (typeof cardType !== 'string' || cardType.trim() === '') {
    return { 
      valid: false, 
      error: "Invalid 'cardType'. Must be a non-empty string." 
    };
  }

  if (!Array.isArray(features)) {
    return { 
      valid: false, 
      error: "Invalid 'features'. Must be an array." 
    };
  }

  return {
    valid: true,
    data: {
      explicit_cards_number: validatedCardsNumber,
      cardType: cardType.trim(),
      features: features.filter(f => typeof f === 'string')
    }
  };
};

const validateROIRequest = (body) => {
  const { 
    cards_number, 
    years, 
    cardType, 
    features = [] 
  } = body;

  const requiredFields = ['cards_number', 'years', 'cardType'];
  const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');

  if (missingFields.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  const parsedYears = Number(years);
  if (!Number.isInteger(parsedYears) || parsedYears <= 0) {
    return { 
      valid: false, 
      error: "Invalid 'years'. Must be a positive integer." 
    };
  }

  const parsedCardsNumber = Number(cards_number);
  if (!Number.isInteger(parsedCardsNumber) || parsedCardsNumber <= 0) {
    return { 
      valid: false, 
      error: "Invalid 'cards_number'. Must be a positive integer." 
    };
  }

  if (typeof cardType !== 'string' || cardType.trim() === '') {
    return { 
      valid: false, 
      error: "Invalid 'cardType'. Must be a non-empty string." 
    };
  }

  if (!Array.isArray(features)) {
    return { 
      valid: false, 
      error: "Invalid 'features'. Must be an array." 
    };
  }

  return {
    valid: true,
    data: {
      years: parsedYears,
      cards_number: parsedCardsNumber,
      cardType: cardType.trim(),
      features: features.filter(f => typeof f === 'string')
    }
  };
};


// Auto ROI calculation endpoint
router.post('/api/roi/auto', async (req, res) => {
  try {
    console.log('Auto ROI Request received:', req.body);

    const validation = validateAutoROIRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const roiData = await callFastAPIAuto(validation.data);
    
    return res.status(200).json({ 
      roiData,
      originalInputs: validation.data 
    });

  } catch (error) {
    console.error('Auto ROI calculation error:', error);
    
    return res.status(500).json({ 
      message: 'Server error calculating Auto ROI',
      error: error.message 
    });
  }
});

// Manual ROI calculation endpoint
router.post('/api/roi/manual', async (req, res) => {
  try {
    console.log('Manual ROI Request received:', req.body);

    const validation = validateManualROIRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const roiData = await callFastAPIManual(validation.data);
    
    return res.status(200).json({ 
      roiData,
      originalInputs: validation.data 
    });

  } catch (error) {
    console.error('Manual ROI calculation error:', error);
    
    return res.status(500).json({ 
      message: 'Server error calculating Manual ROI',
      error: error.message 
    });
  }
});

// Legacy ROI calculation endpoint (for backward compatibility)
router.post('/api/calculate-roi', async (req, res) => {
  try {
    console.log('Legacy ROI Request received:', req.body);

    const validation = validateROIRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const roiData = await callFastAPI(validation.data);
    
    return res.status(200).json({ 
      roiData,
      originalInputs: validation.data 
    });

  } catch (error) {
    console.error('Legacy ROI calculation error:', error);
    
    return res.status(500).json({ 
      message: 'Server error calculating ROI',
      error: error.message 
    });
  }
});

// Public route - ROI calculation (no auth required) - Legacy support
router.post('/calculate-roi', async (req, res) => {
  try {
    const { years, cards_number, cardType, features, ...rest } = req.body;

    // Robust validation for years and cards_number
    const parsedYears = Number(years);
    const parsedCardsNumber = Number(cards_number);
    if (!Number.isInteger(parsedYears) || parsedYears <= 0) {
      return res.status(400).json({ error: "Invalid or missing 'years'. Must be a positive integer." });
    }
    if (!Number.isInteger(parsedCardsNumber) || parsedCardsNumber <= 0) {
      return res.status(400).json({ error: "Invalid or missing 'cards_number'. Must be a positive integer." });
    }

    const fastApiPayload = {
      cards_number: parsedCardsNumber,
      years: parsedYears,
      cardType,
      features: features || []
    };
    console.log('Payload sent to FastAPI /calculate-roi:', fastApiPayload);

    const roiData = await callFastAPI(fastApiPayload);
    return res.status(200).json({ roiData, originalInputs: { years: parsedYears, cards_number: parsedCardsNumber, cardType, features, ...rest } });

  } catch (error) {
    console.error('ROI calculation error:', error);
    res.status(500).json({ message: 'Server error calculating ROI' });
  }
});



// Protected routes - require authentication
router.post('/applications', authMiddleware, async (req, res) => {
  try {
    const applicationData = req.body;
    const userId = req.user.userId;

    // Extract and validate ROI fields for FastAPI
    const { years, volume, features = [], ...rest } = applicationData;
    let parsedYears, cards_number, cardType;
    if (volume) {
      parsedYears = Number(years) || 5;
      cards_number = Number(volume.cards_number);
      cardType = volume.cardType;
    } else {
      parsedYears = Number(years) || 5;
      cards_number = Number(applicationData.cards_number);
      cardType = applicationData.cardType;
    }
    if (!Number.isInteger(parsedYears) || parsedYears <= 0) {
      return res.status(400).json({ error: "Invalid or missing 'years'. Must be a positive integer." });
    }
    if (!Number.isInteger(cards_number) || cards_number <= 0) {
      return res.status(400).json({ error: "Invalid or missing 'cards_number'. Must be a positive integer." });
    }

    // Call FastAPI with validated values
    const roiData = await callFastAPI({
      years: parsedYears,
      cards_number,
      cardType,
      features
    });

    const application = new IaaSApplication({
      ...applicationData,
      userId,
      roiData
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      roiData
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

// Get user's applications
router.get('/applications/user/:userId', authMiddleware, async (req, res) => {
  try {
    const applications = await IaaSApplication.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Fetch applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Get specific application
router.get('/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    const application = await IaaSApplication.findById(req.params.applicationId)
      .populate('userId', 'firstName lastName email company');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Fetch application error:', error);
    res.status(500).json({ message: 'Server error fetching application' });
  }
});

// Admin: Get all applications
router.get('/admin/applications', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const applications = await IaaSApplication.find(query)
      .populate('userId', 'firstName lastName email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await IaaSApplication.countDocuments(query);
    
    res.json({
      applications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalApplications: total
      }
    });
  } catch (error) {
    console.error('Admin fetch applications error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Admin: Update application status
router.put('/admin/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, adminNotes } = req.body;
    
    const application = await IaaSApplication.findByIdAndUpdate(
      req.params.applicationId,
      { status, adminNotes },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email company');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Admin update application error:', error);
    res.status(500).json({ message: 'Server error updating application' });
  }
});

// Admin: Add contact attempt
router.post('/admin/applications/:applicationId/contact', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { method, notes } = req.body;
    
    const application = await IaaSApplication.findByIdAndUpdate(
      req.params.applicationId,
      {
        $push: {
          contactAttempts: {
            date: new Date(),
            method,
            notes
          }
        }
      },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email company');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Admin contact attempt error:', error);
    res.status(500).json({ message: 'Server error adding contact attempt' });
  }
});

module.exports = router;