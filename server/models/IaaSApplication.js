const mongoose = require('mongoose');

const iaasApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    taxId: { type: String, trim: true }
  },
  
  contact: {
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true }, // Made optional to match form
    website: { type: String, required: true, trim: true },
    industry: {
      type: String,
      required: true,
      enum: ['Banking', 'Fintech', 'Telecom', 'Retail', 'E-commerce', 'HR', 'Other'] // Updated to match form options
    }
  },
  
  businessPurpose: {
    useCase: {
      type: String,
      required: true,
      enum: ['Salary Cards', 'Loyalty Program', 'Virtual Cards', 'BNPL', 'Other']
    },
    targetUsers: {
      type: String,
      required: true,
      enum: ['B2C', 'B2B', 'Internal Use', 'Mixed']
    }
  },
  
  compliance: {
    noSanctions: { 
      type: String, // Changed from Boolean to String to match form
      required: true,
      enum: ['Sanctioned', 'Not sanctioned']
    }
  },
  
  // ROI Calculator Inputs - support both auto and manual modes
  roiInputs: {
    calculationType: {
      type: String,
      required: true,
      enum: ['auto', 'manual']
    },
    // Auto ROI fields
    years: { type: Number },
    cards_number: { type: Number },
    starting_number: { type: Number },
    expected_cards_growth_rate: { type: Number },
    // Manual ROI fields
    explicit_cards_number: { type: Map, of: Number }, // {year: number_of_cards}
    // Common fields
    cardType: {
      type: String,
      required: true,
      enum: ['Virtual', 'Physical', 'Both']
    },
    features: [{
      type: String,
      enum: ['Rewards', 'FX', 'Corporate Controls', 'Analytics', 'API Integration', 'Custom Branding']
    }]
  },
  
  // ROI Calculation Results
  roiResults: {
    years: [Number],
    incomes: [Number],
    costs: {
      in_house: [Number],
      iaas: [Number]
    },
    net: {
      in_house: [Number],
      iaas: [Number]
    },
    roi: {
      in_house: [Number],
      iaas: [Number]
    }
  },
  
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