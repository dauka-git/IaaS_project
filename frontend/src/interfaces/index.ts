// src/interfaces/index.ts
export interface Question {
    type: 'multiple_choice' | 'true_false' | 'matching' | 'short_answer';
    subtype?: 'single' | 'multiple' | null;
    text: string;
    options?: string[];
    matches?: { left: string; right: string }[];
    correctAnswer: number | number[] | boolean | string | number[];
    caseSensitive?: boolean;
  }
  
  export interface Quiz {
    _id?: string;
    title: string;
    questions: Question[];
    createdBy: string;
    createdAt?: string;
    userScores?: { userId: string; score: number; total: number; timestamp: string }[];
  }
  
  export interface User {
    _id: string;
    id?: string;
    bin: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    role: 'user' | 'admin';
    phone?: string;
    createdAt: string;
    lastLogin?: string;
  }
  
  export interface ProfileStats {
    bin: string;
  }

  export interface IaaSApplication {
    _id: string;
    userId: string | User;
    companyName: string;
    industry: 'Fintech' | 'E-commerce' | 'Travel' | 'Healthcare' | 'Education' | 'Other';
    issuingCountry: string;
    numberOfCards: number;
    cardType: 'Virtual' | 'Physical' | 'Both';
    expectedMonthlyVolume: number;
    timeline: 'Immediate' | '3 months' | '6 months' | '12 months' | 'Flexible';
    features: string[];
    roiData: ROIData;
    status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Contacted';
    adminNotes?: string;
    contactAttempts: ContactAttempt[];
    createdAt: string;
    updatedAt: string;
  }

  export interface ROIData {
    estimatedSetupCost: number;
    estimatedMonthlyCost: number;
    inHouseSetupCost: number;
    inHouseMonthlyCost: number;
    annualSavings: number;
    breakevenMonths: number;
    threeYearROI: number;
    costsRevenuesTimeline?: {
      years: number;
      transactions_per_year: number;
      total_cost_iaas: number;
      revenue_iaas: number;
      net_iaas: number;
    }[];
  }

  export interface ContactAttempt {
    date: string;
    method: string;
    notes: string;
  }

  export interface ApplicationFormData {
    companyName: string;
    industry: string;
    issuingCountry: string;
    numberOfCardsIn5Years: number;
    cardType: string;
    expectedMonthlyVolume: number;
    timeline: string;
    features: string[];
    ceoFirstName: string;
    ceoLastName: string;
    ceoIin: string;
    cfoFirstName: string;
    cfoLastName: string;
    cfoIin: string;
  }

  export interface AuthResponse {
    message: string;
    token: string;
    user: User;
  }

  export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
  }

  export interface PaginatedResponse<T> {
    applications: T[];
    pagination: {
      current: number;
      total: number;
      totalApplications: number;
    };
  }