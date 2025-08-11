import * as React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  Container, Button, Menu, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemText,
  useTheme, ListItemIcon
} from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HistoryIcon from '@mui/icons-material/History';
import AddchartIcon from '@mui/icons-material/Addchart';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ColorModeContext } from '../../context/themeContext.jsx';
import ToggleTheme from '../../context/toggletheme.jsx';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import  logo from '../../assets/images/logo.svg'; // Adjust the path as necessary

const pages = [
  { name: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
  { name: 'Data Entry', path: '/data-entry', icon: <AddchartIcon /> },
  { name: 'History', path: '/history', icon: <HistoryIcon /> },
];

const settings = ['Profile', 'Account', 'Logout'];

function Navbar({onLogout}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleDrawerClick = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

    const handleLogout = () => {
    onLogout(); // this clears localStorage and state in AppLayout
    navigate('/login'); // redirect to login page
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      {/* 🔁 Scrolling Safety Text */}
      {/* 🔁 Seamless Scrolling Safety Text */}

<Box sx={{
  width: '100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  position: 'fixed',
  top: 0,
  zIndex: 1301,
  backgroundImage: isDark ? 'linear-gradient(to right, #ffc107, #ffca28, #ffd54f, #ffca28, #ffc107)' : 'linear-gradient(to right,rgb(49, 160, 73),rgb(80, 154, 91),rgb(58, 200, 94),rgb(36, 125, 49))',
  color: '#001e3c',
  fontWeight: 'bold',
  fontSize: '14px',
  py: 0.5,
}}>
  <Box
    sx={{
      display: 'inline-flex',
      whiteSpace: 'nowrap',
      py: 0.5,
      animation: 'scrollText 15s linear infinite',
      '@keyframes scrollText': {
        '0%': { transform: 'translateX(0%)' },
        '100%': { transform: 'translateX(-30%)' },
      },
    }}
  >
    {[
      "Always turn off the regulator when not in use.",
      "Keep LPG cylinders in a well-ventilated area.",
      "Check for gas leaks using soap solution, not a flame!",
      "Use BIS-approved regulators and tubes.",
      "Stay alert, stay safe with FlameShield."
    ].map((text, index) => (
      <Typography key={index} sx={{ display: 'flex', alignItems: 'center', mx: 4, }}>
        <AutoAwesomeIcon sx={{ mr: 1, fontSize: '18px' }} />
        {text}
      </Typography>
    ))}
  </Box>
</Box>

      {/* ⬇ Navbar shifted down due to banner height (30px) */}
      <AppBar
        position="fixed"
        sx={{
          top: '40px',
          background: isDark
            ? 'linear-gradient(160deg,rgb(3, 19, 98),rgb(34, 41, 74), #0A0F28)'
            : 'linear-gradient(160deg,rgb(184, 195, 241),rgb(184, 195, 241))',
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Toolbar disableGutters sx={{ px: 2 }}>
           <Box
  component="a"
  href="/"
  sx={{
    display: { xs: 'none', md: 'flex' },
    alignItems: 'center',
    ml: 5,
    textDecoration: 'none'
  }}
>
  <Box
    component="img"
    src={logo}
    alt="FlameShield Logo"
    sx={{
      height: 60,        // 🔁 Adjust as needed
      width: 'auto',
    }}
  />
</Box>

            {/* Drawer - Mobile */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton size="large" onClick={toggleDrawer(true)}>
                <SortRoundedIcon sx={{ fontSize: '28px', fontWeight: 'bold', color: primaryColor, ml: -1 }} />
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)} sx={{zIndex: 1400}}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: `2px solid ${primaryColor}`, m: 2 }}>
                    <AdbIcon sx={{ color: primaryColor, mr: 1 }} />
                    <Typography
                      noWrap
                      component="a"
                      href="/"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        textDecoration: 'none',
                        color: primaryColor,
                      }}
                    >
                      FlameShield
                    </Typography>
                  </Box>
                  <List>
                    {pages.map((page) => {
                      const isActive = location.pathname === page.path;
                      return (
                        <ListItem key={page.name} disablePadding>
                          <ListItemButton
                            onClick={() => handleDrawerClick(page.path)}
                            sx={{
                              display: 'flex',
                              gap: '10px',
                              bgcolor: isActive ? (isDark ? '#0e224d' : '#e3e9fd') : 'transparent',
                              borderLeft: isActive ? `4px solid ${primaryColor}` : 'none',
                            }}
                          >
                            <ListItemIcon sx={{ color: isActive ? primaryColor : 'inherit' }}>
                              {page.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={page.name}
                              sx={{
                                textTransform: "none",
                                fontWeight: isActive ? 'bold' : 'normal',
                                color: isActive ? primaryColor : isDark ? '#fff' : '#000',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </Drawer>
            </Box>

            {/* Logo - Mobile */}
            <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: primaryColor }} />
            <Typography
              noWrap
              component="a"
              href="/"
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                textDecoration: 'none',
                color: primaryColor,
              }}
            >
              FlameShield
            </Typography>
            {/* Desktop Menu */} 
            <Box sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-end',
              marginRight: '60px',
              gap: '30px',
            }}>
              {pages.map((page) => {
                const isActive = location.pathname === page.path;
                return (
                  <Button
                    key={page.name}
                    onClick={() => handleDrawerClick(page.path)}
                    startIcon={page.icon}
                    sx={{
                      my: 2,
                      color: isActive ? secondaryColor : primaryColor,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      borderBottom: isActive ? `2px solid ${secondaryColor}` : 'none',
                      borderRadius: 0,
                    }}
                  >
                    {page.name}
                  </Button>
                );
              })}
            </Box>

            {/* Theme + Logout */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <ToggleTheme isDark={isDark} toggleTheme={colorMode.toggleColorMode} />
              <Button
              onClick={handleLogout}
                sx={{
                  color: primaryColor,
                  fontWeight: 'bold',
                  ml: 1,
                  border: `2px solid ${primaryColor}`,
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  borderRadius: '20px',
                  '&:hover': {
                    boxShadow: `0 0 4px ${primaryColor}, 0 0 4px ${primaryColor}`,
                    backgroundColor: primaryColor,
                    color: 'white',
                    border: `2px solid #fff`,
                  }
                }}
              >
                Logout
              </Button>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography>{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}

export default Navbar;
