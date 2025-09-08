// src/context/themeContext.jsx
import React, { createContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext();

const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
              primary: { main: '#0D47A1' },
              secondary: { main: '#071585' },
              background: {
                default: '#f5f5f5',
                paper: '#ffffff',
              },
            }
          : {
              primary: { main: '#90CAF9' },
              secondary: { main: '#03f8fa' },
              background: {
                default: '#121212',
                paper: '#1e1e1e',
              },
            }),
      },
    }), [mode]);

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeContextProvider;