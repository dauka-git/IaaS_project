const mongoose = require('mongoose');

const iaasApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Step 1: Basic Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  ceoFirstName: { type: String, required: true, trim: true },
  ceoLastName: { type: String, required: true, trim: true },
  ceoIin: { type: String, required: true, trim: true },
  cfoFirstName: { type: String, required: true, trim: true },
  cfoLastName: { type: String, required: true, trim: true },
  cfoIin: { type: String, required: true, trim: true },
  industry: {
    type: String,
    required: true,
    enum: ['Fintech', 'E-commerce', 'Banking', 'Telecom', 'HR', 'Other']
  },
  issuingCountry: {
    type: String,
    required: true,
    trim: true
  },
  
  // Step 2: Card Requirements
  numberOfCardsIn5Years: {
    type: Number,
    required: true,
    min: 1,
    max: 1000000
  },
  cardType: {
    type: String,
    required: true,
    enum: ['Virtual', 'Physical', 'Both']
  },
  expectedMonthlyVolume: {
    type: Number,
    required: true,
    min: 0
  },
  // cardSpecification: {
  //   type: String,
  //   required: true,
  //   enum: ['Issuing + Acquiring', 'Settlement Bank', 'Bin Sponsorship']
  // },
  
  // Step 3: Timeline
  timeline: {
    type: String,
    required: true,
    enum: ['3 months', '6 months', '12 months', 'Flexible']
  },
  
  // Step 4: Additional Requirements
  features: [{
    type: String,
    enum: ['Rewards', 'FX', 'Corporate Controls', 'Analytics', 'API Integration', 'Custom Branding']
  }],
  
  // Calculated ROI Data
  roiData: {
    estimatedSetupCost: Number,
    estimatedMonthlyCost: Number,
    inHouseSetupCost: Number,
    inHouseMonthlyCost: Number,
    annualSavings: Number,
    breakevenMonths: Number,
    threeYearROI: Number
  },
  
  // Status and Admin
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Contacted'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  contactAttempts: [{
    date: Date,
    method: String,
    notes: String
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
iaasApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('IaaSApplication', iaasApplicationSchema); 