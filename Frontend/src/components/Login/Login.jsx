import React, { useContext, useState } from 'react';
import {
  Box, TextField, Button, Typography, Container,
  Snackbar, Alert, IconButton, InputAdornment, Stack,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
import { ColorModeContext } from '../../context/themeContext';

function Login({ onLoginSuccess }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone_no: '', address: '', password: '', confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone_no: '', address: '', password: '', confirmPassword: ''
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error',
      });
    }

    try {
      const url = isLogin
        ? 'http://localhost:5000/api/users/login'
        : 'http://localhost:5000/api/users/register';

      const payload = isLogin
        ? { phone_no: formData.phone_no, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            phone_no: formData.phone_no,
            address: formData.address,
            password: formData.password,
          };

      const res = await axios.post(url, payload);
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });

      if (isLogin) {
        const userId = res.data.user_id; // ✅ get user_id from backend response
        localStorage.setItem('userId', userId); // ✅ store user ID
        console.log('User ID:', userId);
        onLoginSuccess(); // existing callback
        navigate('/');
      }

      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong';
      setErrorMessage(isLogin && msg.includes('Invalid') ? msg : '');
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isDark ? '#193d65ff' : 'background.default',
        overflow: 'hidden',
        px: 2
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Box
          sx={{
            p: 4,
            maxHeight: isLogin ? 'auto' : '90vh',
            overflowY: isLogin ? 'visible' : 'auto',
            '::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            borderRadius: 3,
            bgcolor: isDark ? '#273568' : 'background.paper',
            textAlign: 'center',
            boxShadow: `0 0 10px 10px ${primaryColor}50`,
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src={logo}
            alt="FlameShield Logo"
            sx={{ height: 80, mb: 2 }}
          />

          <Typography variant="h5" mb={3} fontWeight="bold">
            {isLogin ? 'Login' : 'Sign Up'}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {!isLogin && (
                <>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    fullWidth
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    fullWidth
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    fullWidth
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              <TextField
                label="Phone Number"
                name="phone_no"
                value={formData.phone_no}
                fullWidth
                onChange={handleChange}
                required
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                fullWidth
                onChange={handleChange}
                required
                inputProps={{
                  pattern: "^(?=.*[!@#$%^&*])(?=.*[0-9])(?=.{8,})[^\\s]*$"
                }}
                helperText={!isLogin ? "Min 8 chars, 1 special char, 1 number, no spaces" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {!isLogin && (
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  fullWidth
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}

              {errorMessage && (
                <Typography color="error" fontSize="14px">{errorMessage}</Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 1,
                  py: 1.3,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  borderRadius: '25px'
                }}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>
            </Stack>
          </form>

          <Typography mt={3} fontSize="15px">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Button onClick={toggleMode} sx={{ fontWeight: 'bold', textTransform: 'none' }}>
              {isLogin ? 'Sign Up' : 'Login'}
            </Button>
          </Typography>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Login;
