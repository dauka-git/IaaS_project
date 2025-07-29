// src/utils/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { User, IaaSApplication, ROIData, AuthResponse, PaginatedResponse, AutoROIRequest, ManualROIRequest, ROIrequest } from '../interfaces';

// import {ApplicationFormData } from '../interfaces';

// const API_BASE_URL = 'https://iaas-project-server.onrender.com';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, profileData: {
    firstName: string;
    lastName: string;
    company?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await api.put(`/profile/${userId}`, profileData);
    return response.data;
  },
};

export const roiAPI = {
  // Auto ROI calculation (for application form - default values)
  calculateAutoROI: async (roiData: AutoROIRequest): Promise<{ roiData: ROIData }> => {
    const response = await api.post('/api/roi/auto', roiData);
    return response.data;
  },

  // Manual ROI calculation (for standalone calculator)
  calculateManualROI: async (roiData: ManualROIRequest): Promise<{ roiData: ROIData }> => {
    const response = await api.post('/api/roi/manual', roiData);
    return response.data;
  },

  // Legacy endpoint for backward compatibility
  calculateROI: async (applicationData: ROIrequest): Promise<{ roiData: ROIData }> => {
    const response = await api.post('/api/calculate-roi', applicationData);
    return response.data;
  },
};

// IaaS Application API
export const iaasAPI = {
  submitApplication: async (applicationData: any): Promise<{
    message: string;
    application: any;
    roiData: ROIData;
  }> => {
    // Accepts nested structure as in ApplicationFormPage
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  getUserApplications: async (userId: string): Promise<any[]> => {
    const response = await api.get(`/applications/user/${userId}`);
    return response.data;
  },

  getApplication: async (applicationId: string): Promise<any> => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  calculateROI: async (applicationData: ROIrequest): Promise<{ roiData: ROIData }> => {
    const response = await api.post('/api/calculate-roi', applicationData);
    return response.data;
  },

  // Admin endpoints
  getAllApplications: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<IaaSApplication>> => {
    const response = await api.get('/admin/applications', { params });
    return response.data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    data: { status: string; adminNotes?: string }
  ): Promise<IaaSApplication> => {
    const response = await api.put(`/admin/applications/${applicationId}`, data);
    return response.data;
  },

  addContactAttempt: async (
    applicationId: string,
    data: { method: string; notes: string }
  ): Promise<IaaSApplication> => {
    const response = await api.post(`/admin/applications/${applicationId}/contact`, data);
    return response.data;
  },
};

export default api;
