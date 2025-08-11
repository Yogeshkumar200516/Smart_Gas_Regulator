import React from 'react';
import { Box, Typography, useTheme, Grid, Paper } from '@mui/material';
import GasMeterIcon from '@mui/icons-material/GasMeter';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import DevicesIcon from '@mui/icons-material/Devices';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const DashboardCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.mode === 'dark' ? '#1e2b44' : '#f0f4ff',
        borderLeft: `6px solid ${color}`,
        borderRadius: '12px',
      }}
    >
      <Box>
        <Typography variant="subtitle1" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box color={color} fontSize="2.5rem">
        {icon}
      </Box>
    </Paper>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Box sx={{ minHeight: '100vh', px: 4, pt: 12, pb: 6 }}>
      {/* Existing Title */}
      <Typography
        sx={{
          fontSize: 24,
          color: primaryColor,
          textAlign: { xs: 'center', sm: 'left' },
          fontWeight: 'bold',
          marginBottom: 2,
        }}
      >
        Dashboard Page
      </Typography>

      {/* Dashboard Cards */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Current Gas Level"
            value="65%"
            icon={<GasMeterIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Leakage Status"
            value="No Leak"
            icon={<WarningIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="AI Prediction"
            value="5 Days Left"
            icon={<AvTimerIcon />}
            color="#ff6f00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Last Refill Date"
            value="June 28, 2025"
            icon={<CalendarMonthIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="System Health"
            value="Optimal"
            icon={<HealthAndSafetyIcon />}
            color="#00acc1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Connected Device"
            value="Raspberry Pi - Active"
            icon={<DevicesIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12}>
          <DashboardCard
            title="Notifications"
            value="2 Active Alerts"
            icon={<NotificationsActiveIcon />}
            color="#e91e63"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
