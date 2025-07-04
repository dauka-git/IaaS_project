// src/utils/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { User, IaaSApplication, ApplicationFormData, ROIData, AuthResponse, PaginatedResponse } from '../interfaces';

const API_BASE_URL = 'https://iaas-project-server.onrender.com';

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
    bin: string;
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

// IaaS Application API
export const iaasAPI = {
  submitApplication: async (applicationData: ApplicationFormData): Promise<{
    message: string;
    application: IaaSApplication;
    roiData: ROIData;
  }> => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  getUserApplications: async (userId: string): Promise<IaaSApplication[]> => {
    const response = await api.get(`/applications/user/${userId}`);
    return response.data;
  },

  getApplication: async (applicationId: string): Promise<IaaSApplication> => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  calculateROI: async (applicationData: ApplicationFormData): Promise<{ roiData: ROIData }> => {
    const response = await api.post('/calculate-roi', applicationData);
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
