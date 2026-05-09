import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  CssBaseline, useTheme, useMediaQuery, IconButton, Divider,
  Typography, Avatar, Toolbar, AppBar
} from '@mui/material';
import {
  Dashboard, Category, Inventory2, Logout, ShoppingCart,
  Receipt, HelpOutline, Policy, People, Business, Menu as MenuIcon,
  StorefrontRounded
} from '@mui/icons-material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { getRole, isSuperAdmin } from '../auth';

const drawerWidth = 240;

const ALL_MENU = [
  { text: 'Dashboard',      icon: <Dashboard />,    path: '/dashboard',       roles: ['superadmin','admin'] },
  { text: 'Businesses',     icon: <Business />,     path: '/businesses',      roles: ['superadmin','admin'] },
  { text: 'Admins',         icon: <People />,       path: '/admins',          roles: ['superadmin'] },
  { text: 'Categories',     icon: <Category />,     path: '/categories',      roles: ['superadmin','admin'] },
  { text: 'Products',       icon: <Inventory2 />,   path: '/products',        roles: ['superadmin','admin'] },
  { text: 'Users',          icon: <People />,       path: '/users',           roles: ['superadmin','admin'] },
  { text: 'Orders',         icon: <Receipt />,      path: '/orders',          roles: ['superadmin','admin'] },
  { text: 'Place Order',    icon: <ShoppingCart />, path: '/place-order',     roles: ['superadmin','admin'] },
  { text: 'FAQ',            icon: <HelpOutline />,  path: '/faq',             roles: ['superadmin', 'admin'] },
  { text: 'Privacy Policy', icon: <Policy />,       path: '/privacy-policy',  roles: ['superadmin', 'admin'] },
];

const PAGE_TITLES = Object.fromEntries(ALL_MENU.map(m => [m.path, m.text]));

const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#4f46e5', light: '#818cf8', dark: '#3730a3', contrastText: '#fff' },
    secondary:  { main: '#f59e0b', light: '#fcd34d', dark: '#d97706', contrastText: '#fff' },
    success:    { main: '#10b981' },
    background: { default: '#f1f5f9', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});

const SIDEBAR_BG   = '#0f172a';
const SIDEBAR_TEXT = 'rgba(255,255,255,0.75)';
const ACTIVE_BG    = 'rgba(99,102,241,0.18)';
const ACTIVE_TEXT  = '#818cf8';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const role = getRole();
  const menuItems = ALL_MENU.filter(m => m.roles.includes(role));
  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin';

  const handleLogout = () => {
    ['token','role','business','businessName'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: SIDEBAR_BG }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 2,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <StorefrontRounded sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Ecom Admin
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'capitalize' }}>
            {role === 'superadmin' ? 'Super Admin' : localStorage.getItem('businessName') || 'Admin'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2 }} />

      {/* Nav Items */}
      <List sx={{ px: 1.5, pt: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                py: 0.9,
                bgcolor: active ? ACTIVE_BG : 'transparent',
                color: active ? ACTIVE_TEXT : SIDEBAR_TEXT,
                transition: 'all 0.15s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#fff' },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 36,
                color: active ? ACTIVE_TEXT : SIDEBAR_TEXT,
                '& svg': { fontSize: 20 }
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}
              />
              {active && (
                <Box sx={{
                  width: 4, height: 20, borderRadius: 4,
                  bgcolor: ACTIVE_TEXT, flexShrink: 0
                }} />
              )}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2 }} />

      {/* Logout */}
      <List sx={{ px: 1.5, pb: 2, pt: 1 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2, px: 1.5, py: 0.9, color: SIDEBAR_TEXT,
            '&:hover': { bgcolor: 'rgba(239,68,68,0.12)', color: '#f87171' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& svg': { fontSize: 20 } }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13.5 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={customTheme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <CssBaseline />

          {/* Sidebar */}
          <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            <Drawer
              variant={isMobile ? 'temporary' : 'permanent'}
              open={isMobile ? mobileOpen : true}
              onClose={() => setMobileOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  bgcolor: SIDEBAR_BG,
                  border: 'none',
                  boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>

          {/* Main */}
          <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Top Bar */}
            <AppBar
              position="sticky"
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              <Toolbar sx={{ gap: 1 }}>
                {isMobile && (
                  <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, fontSize: 17 }}>
                  {currentTitle}
                </Typography>
                <Avatar
                  sx={{
                    width: 34, height: 34,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  A
                </Avatar>
              </Toolbar>
            </AppBar>

            {/* Page Content */}
            <Box sx={{ flexGrow: 1, p: isMobile ? 1.5 : 3, overflow: 'auto' }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default Layout;
