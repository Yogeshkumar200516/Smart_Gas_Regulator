import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Dashboard from '../pages/Dashboard/Dashboard';
import DataEntry from '../pages/DataEntry/DataEntry';
import History from '../pages/History/History';
import { Box, CircularProgress } from '@mui/material';
import Login from '../components/Login/Login';

function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // ✅ loading state

  // ✅ Check login status from localStorage on load
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
    setIsAuthChecked(true);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true'); // ✅ persistent login
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  // ✅ Show loader until we know if user is logged in
  if (!isAuthChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <Box sx={{ mt: isAuthenticated ? '116px' : 0 }}>
        <Routes>
          {/* ✅ Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to={window.location.pathname} replace /> // stay where user was
                : <Login onLoginSuccess={handleLoginSuccess} />
            }
          />

          {/* ✅ Protected Routes */}
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/data-entry" element={isAuthenticated ? <DataEntry /> : <Navigate to="/login" />} />
          <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />

          {/* ✅ Fallback Route */}
          <Route
            path="*"
            element={
              isAuthenticated
                ? <Navigate to={window.location.pathname} replace /> // don't jump to dashboard
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Box>
    </Router>
  );
}

export default AppLayout;
