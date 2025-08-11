import * as React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  Container, Avatar, Button, Tooltip, Menu, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemText,
  useTheme, ListItemIcon
} from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HistoryIcon from '@mui/icons-material/History';
import AddchartIcon from '@mui/icons-material/Addchart';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ColorModeContext } from '../../context/themeContext.jsx';
import ToggleTheme from '../../context/toggletheme.jsx';
import SortRoundedIcon from '@mui/icons-material/SortRounded';

const pages = [
  { name: 'Dashboard', path: '/', icon: <DashboardOutlinedIcon /> },
  { name: 'Data Entry', path: '/data-entry', icon: <AddchartIcon /> },
  { name: 'History', path: '/history', icon: <HistoryIcon /> },
];

const settings = ['Profile', 'Account', 'Logout'];

function Navbar() {
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

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: isDark
            ? 'linear-gradient(160deg,rgb(3, 19, 98),rgb(34, 41, 74), #0A0F28)'
            : 'linear-gradient(160deg,rgb(184, 195, 241),rgb(184, 195, 241),rgb(184, 195, 241),rgb(184, 195, 241))',
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Toolbar disableGutters sx={{ px: 2 }}>
            {/* Logo - Desktop */}
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, ml: 8, color: primaryColor }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: primaryColor,
                textDecoration: 'none',
                fontSize: '25px'
              }}
            >
              FlameShield
            </Typography>

            {/* Drawer - Mobile */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton size="large" color="inherit" onClick={toggleDrawer(true)}>
                <SortRoundedIcon sx={{fontSize: '28px', fontWeight: 'bold', color: primaryColor, ml: -1}}/>
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onClick={toggleDrawer(false)}
                  onKeyDown={toggleDrawer(false)}
                >
                <Box sx={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: `2px solid ${primaryColor}`, m:  2 }}>
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
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'flex-end',
                marginRight: '60px',
                gap: '30px',
              }}
            >
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
                      display: 'flex',
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

            {/* User Controls */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <ToggleTheme isDark={isDark} toggleTheme={colorMode.toggleColorMode} />
              <Button
                sx={{
                  color: primaryColor,
                  fontWeight: 'bold',
                  ml: 1,
                  border: isDark ? `2px solid ${primaryColor}` : `2px solid ${primaryColor}`,
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
