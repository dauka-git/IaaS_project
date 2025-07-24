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
  representative: {


  },
  contact: {
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    industry: {
      type: String,
      required: true,
      enum: ['Bank', 'Fintech', 'Telecom', 'Retail', 'eCommerce', 'Other']
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
    },
    expectedVolume: { type: Number, required: true, min: 1 }
  },
  compliance: {
    noSanctions: { type: Boolean, required: true },
    consent: { type: Boolean, required: true }
  },
  volume: {
    numberOfCardsIn5Years: { type: Number, required: true, min: 10000 },
    cardType: {
      type: String,
      required: true,
      enum: ['Virtual', 'Physical', 'Both']
    },
    expectedMonthlyVolume: { type: Number, required: true, min: 0 },
    timeline: {
      type: String,
      required: true,
      enum: ['Immediate', '3 months', '6 months', '12 months', 'Flexible']
    }
  },
  features: [{
    type: String,
    enum: ['Rewards', 'FX', 'Corporate Controls', 'Analytics', 'API Integration', 'Custom Branding']
  }],
  roiData: {
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