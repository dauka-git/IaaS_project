import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../interfaces';
import { authAPI } from '../utils/api';

interface UserContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    bin: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone?: string;
  }) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('User data parsing failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    bin: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone?: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);