import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Dashboard from '../pages/Dashboard/Dashboard';
import DataEntry from '../pages/DataEntry/DataEntry';
import History from '../pages/History/History';
import { Box } from '@mui/material';
import Login from '../components/Login/Login';

function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check login status on load
  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn');
    setIsAuthenticated(auth === 'true');
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <Box sx={{ mt: isAuthenticated ? '132px' : 0 }}>
        <Routes>
          {/* Login Page Route */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate onLogout={handleLogout} to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />
          } />

          {/* Protected Routes */}
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/data-entry" element={isAuthenticated ? <DataEntry /> : <Navigate to="/login" />} />
          <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default AppLayout;
