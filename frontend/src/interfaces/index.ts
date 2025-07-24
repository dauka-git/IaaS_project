// src/interfaces/index.ts

  
  
  export interface User {
    _id: string;
    id?: string;
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

  ///---------ROI---------

  export interface ROIData {
    years: number[];
  incomes: number[];
  costs: {
    in_house: number[];
    iaas: number[];
  };
  net: {
    in_house: number[];
    iaas: number[];
  };
  roi: {
    in_house: number[];
    iaas: number[];
  };
}

export interface AutoROIRequest {
  years: number;
  cards_number: number;
  cardType: string;
  features: string[];
  starting_number: number;
  expected_cards_growth_rate: number;
}

// Manual ROI calculation (for standalone ROI calculator)
export interface ManualROIRequest {
  explicit_cards_number: { [year: number]: number }; // {year: cards_number}
  cardType: string;
  features: string[];
}

export interface ROIrequest {
  cards_number: number;
  years: number;
  cardType: string;
  features: string[];
  // Optional fields for auto ROI
  starting_number?: number;
  expected_cards_growth_rate?: number;
  // Optional field for manual ROI
  explicit_cards_number?: { [year: number]: number };
}

  

  ///---------Contact Attempt---------

  export interface ContactAttempt {
    date: string;
    method: string;
    notes: string;
  }

  // export interface ApplicationFormData {
  //   companyName: string;
  //   industry: string;
  //   issuingCountry: string;
  //   numberOfCardsIn5Years: number;
  //   cardType: string;
  //   expectedMonthlyVolume: number;
  //   timeline: string;
  //   features: string[];
  //   ceoFirstName: string;
  //   ceoLastName: string;
  //   ceoIin: string;
  //   cfoFirstName: string;
  //   cfoLastName: string;
  //   cfoIin: string;
  // }

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

  export interface TypingTextProps {
      words?: string[];
      typingSpeed?: number;
      deleteSpeed?: number;
      delayBetweenWords?: number;
    };

  