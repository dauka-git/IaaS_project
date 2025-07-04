const express = require('express');
const IaaSApplication = require('../models/IaaSApplication');
const User = require('../models/User');
const authMiddleware = require('./authMiddleware');
const router = express.Router();

// Business logic for ROI calculations
const calculateCostsRevenues10k = (Y, N, cards_number, cardType, features = []) => {
    features = features || [];
    // Defensive: ensure all numbers are valid
    if (!cards_number || isNaN(cards_number)) cards_number = 1;
    if (!N || isNaN(N)) N = 1;
    if (!Y || isNaN(Y)) Y = 1;
    if (!cardType) cardType = 'Virtual';
    const step = cards_number / 10000;
    const capex_phys = 365000;
    const capex_virt= 315000;
    const opex = 44000 + 1000 * (features ? features.length : 0);
    let total_cost_iaas;
    if (cardType === 'Virtual') {
        total_cost_iaas = (365000 + (opex * Y) + 0.14 * (N * Y)) * step;
    } else if (cardType === 'Physical'){
        total_cost_iaas = (415000 + (opex * Y) + 0.14 * (N * Y)) * step;
    } else {
        total_cost_iaas = (capex_phys + capex_virt + (opex * Y) + 0.14 * (N * Y)) * step;
    }
    const base = Y *N * 50 * (0.8*0.018 + 0.2*0.013);
    const revenue_iaas = base  * 1.015 * step;
    const net_iaas = revenue_iaas - total_cost_iaas;
    console.log('calculateCostsRevenues10k:', {Y, N, cards_number, cardType, features, step, total_cost_iaas, revenue_iaas, net_iaas});
    return {
        years: Y,
        transactions_per_year: N,
        total_cost_iaas: total_cost_iaas,
        revenue_iaas: revenue_iaas,
        net_iaas: net_iaas,
    };
};

const calculateROI = (applicationData) => {
  const {
    numberOfCardsIn5Years,
    expectedMonthlyVolume,
    cardType,
    timeline,
    customTimelineMonths, // for 'flexible' from frontend
    features = [] // <--- default to empty array
  } = applicationData;
  console.log('calculateROI input:', { numberOfCardsIn5Years, expectedMonthlyVolume, cardType, timeline, customTimelineMonths, features });
  const cards = numberOfCardsIn5Years || applicationData.numberOfCards || 1;
  const N = expectedMonthlyVolume * 12 || 1;
  let months = 12; // default 1 year
  if (typeof timeline === 'string') {
    if (timeline.toLowerCase() === 'immediate') {
      months = 1;
    } else if (timeline.toLowerCase() === 'flexible' && customTimelineMonths) {
      months = customTimelineMonths;
    } else {
      const match = timeline.match(/(\d+)/);
      if (match) {
        months = parseInt(match[1], 10);
      }
    }
  }
  if (!months || isNaN(months)) months = 1;
  const years = months / 12;
  console.log('cards:', cards, 'N:', N, 'months:', months, 'years:', years);
  const costsRevenuesTimeline = [];
  for (let m = 1; m <= months; m++) {
    const y = m / 12;
    const point = calculateCostsRevenues10k(y, N, cards, cardType, features);
    costsRevenuesTimeline.push(point);
  }
  console.log('costsRevenuesTimeline:', costsRevenuesTimeline);
  const yearVal = costsRevenuesTimeline[costsRevenuesTimeline.length - 1];
  return {
    estimatedSetupCost: yearVal ? Math.round(yearVal.total_cost_iaas) : null,
    estimatedMonthlyCost: yearVal ? Math.round(yearVal.total_cost_iaas / months) : null,
    inHouseSetupCost: 0,
    inHouseMonthlyCost: 0,
    annualSavings: yearVal ? Math.round(yearVal.net_iaas / (years || 1)) : null,
    breakevenMonths: yearVal && yearVal.net_iaas > 0 ? 12 : null,
    threeYearROI: yearVal && yearVal.revenue_iaas > 0 ? Math.round((yearVal.net_iaas / yearVal.total_cost_iaas) * 100) : null,
    costsRevenuesTimeline: costsRevenuesTimeline.length > 0 ? costsRevenuesTimeline : null
  };
};

// Public route - ROI calculation (no auth required)
router.post('/calculate-roi', async (req, res) => {
  try {
    const applicationData = req.body;
    const roiData = calculateROI(applicationData);
    
    res.json({ roiData });
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
    
    // Calculate ROI
    const roiData = calculateROI(applicationData);
    
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