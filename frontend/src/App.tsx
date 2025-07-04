import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { UserProvider } from './components/UserContext';
import HomePage from './pages/HomePage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply/:userId" element={<ApplicationFormPage />} />
          <Route path="/apply" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/:userId" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/profile" element={<Navigate to="/login" />} />
          <Route path="/home/:userId" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;