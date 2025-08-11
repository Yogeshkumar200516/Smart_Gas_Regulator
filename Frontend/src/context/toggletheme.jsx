// src/components/ToggleTheme.jsx
import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function ToggleTheme({ isDark, toggleTheme }) {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
  return (<Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`} arrow>
    <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1, color: primaryColor }}>
      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  </Tooltip>
  );
}

export default ToggleTheme;
