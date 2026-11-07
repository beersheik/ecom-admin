import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader,
  useTheme, useMediaQuery, IconButton, Divider, Typography, Avatar, Toolbar, AppBar,
  Menu, MenuItem, Chip, Tooltip
} from '@mui/material';
import {
  SpaceDashboardOutlined, CategoryOutlined, Inventory2Outlined, Logout, ReceiptLongOutlined,
  HelpOutline, PolicyOutlined, PeopleOutline, StorefrontOutlined, Menu as MenuIcon,
  CampaignOutlined, AdminPanelSettingsOutlined, KeyboardArrowDown
} from '@mui/icons-material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getRole } from '../auth';
import BrandMark from './BrandMark';
import { BRAND_FILL, INK, PAPER, SIDEBAR } from '../theme';
import NotificationBell from './NotificationBell';

const drawerWidth = 248;

// Grouped so the sidebar reads as "what do I want to do" rather than one long list.
const NAV = [
  { group: null, items: [
    { text: 'Dashboard', icon: <SpaceDashboardOutlined />, path: '/dashboard', roles: ['superadmin', 'admin'] },
  ] },
  { group: 'Sales', items: [
    { text: 'Orders', icon: <ReceiptLongOutlined />, path: '/orders', roles: ['superadmin', 'admin'] },
    { text: 'Users', icon: <PeopleOutline />, path: '/users', roles: ['superadmin', 'admin'] },
    { text: 'Announcements', icon: <CampaignOutlined />, path: '/announcements', roles: ['superadmin', 'admin'] },
  ] },
  { group: 'Catalog', items: [
    { text: 'Products', icon: <Inventory2Outlined />, path: '/products', roles: ['superadmin', 'admin'] },
    { text: 'Categories', icon: <CategoryOutlined />, path: '/categories', roles: ['superadmin', 'admin'] },
  ] },
  { group: 'Store', items: [
    { text: 'Businesses', superText: 'Businesses', adminText: 'My Business', icon: <StorefrontOutlined />, path: '/businesses', roles: ['superadmin', 'admin'] },
    { text: 'FAQ', icon: <HelpOutline />, path: '/faq', roles: ['superadmin', 'admin'] },
    { text: 'Privacy Policy', icon: <PolicyOutlined />, path: '/privacy-policy', roles: ['superadmin', 'admin'] },
    { text: 'Admins', icon: <AdminPanelSettingsOutlined />, path: '/admins', roles: ['superadmin'] },
  ] },
];

const { bg: SIDEBAR_BG, text: SIDEBAR_TEXT, activeBg: ACTIVE_BG, activeText: ACTIVE_TEXT } = SIDEBAR;

const SESSION_KEYS = ['token', 'role', 'business', 'businessName', 'adminName', 'adminEmail'];

const initials = (name, email) => {
  const source = (name || email || 'A').trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || 'A') + (name && parts[1] ? parts[1][0] : '')).toUpperCase();
};

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountAnchor, setAccountAnchor] = React.useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const role = getRole();
  const superAdmin = role === 'superadmin';
  const businessName = localStorage.getItem('businessName') || '';
  const adminName = localStorage.getItem('adminName') || '';
  const adminEmail = localStorage.getItem('adminEmail') || '';
  const roleLabel = superAdmin ? 'Super admin' : 'Admin';

  const handleLogout = () => {
    SESSION_KEYS.forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: SIDEBAR_BG }}>
      <Box component={Link} to="/dashboard" onClick={() => setMobileOpen(false)} sx={{ px: 2.5, py: 2.75, textDecoration: 'none' }}>
        <BrandMark caption={superAdmin ? 'Super admin' : businessName || 'Admin'} />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2 }} />

      <Box component="nav" aria-label="Main" sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, pt: 1 }}>
        {NAV.map(({ group, items }) => {
          const visible = items.filter(i => i.roles.includes(role));
          if (!visible.length) return null;
          return (
            <List
              key={group || 'top'}
              dense
              subheader={group && (
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent', color: 'rgba(250,247,242,0.62)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: '32px', px: 1.5, mt: 1 }}>
                  {group}
                </ListSubheader>
              )}
            >
              {visible.map((item) => {
                const active = location.pathname === item.path;
                const label = item.adminText && !superAdmin ? item.adminText : item.text;
                return (
                  <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      borderRadius: 2, mb: 0.25, px: 1.5, py: 0.85,
                      bgcolor: active ? ACTIVE_BG : 'transparent',
                      color: active ? '#fff' : SIDEBAR_TEXT,
                      '&:hover': { bgcolor: active ? ACTIVE_BG : 'rgba(255,255,255,0.06)', color: '#fff' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: active ? ACTIVE_TEXT : 'inherit', '& svg': { fontSize: 20 } }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 600 : 500 }} />
                  </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 2 }} />
      <List sx={{ px: 1.5, py: 1.5 }}>
        <ListItem disablePadding>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, px: 1.5, py: 0.85, color: SIDEBAR_TEXT, '&:hover': { bgcolor: 'rgba(239,68,68,0.12)', color: '#fca5a5' } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& svg': { fontSize: 20 } }}><Logout /></ListItemIcon>
          <ListItemText primary="Log out" primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500 }} />
        </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar: permanent on desktop, slide-in on phones and tablets */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: SIDEBAR_BG, border: 'none' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar: who you are and where you are; each page shows its own title */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: PAPER, borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 60, md: 64 } }}>
            {isMobile && (
              <>
                <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                  <MenuIcon />
                </IconButton>
                <Box component={Link} to="/dashboard" sx={{ textDecoration: 'none' }}>
                  <BrandMark size={30} nameColor={INK} />
                </Box>
              </>
            )}
            {!isMobile && (
              <Chip
                icon={superAdmin ? <AdminPanelSettingsOutlined /> : <StorefrontOutlined />}
                label={superAdmin ? 'All businesses' : businessName || 'My business'}
                variant="outlined"
                sx={{ fontWeight: 600, borderColor: 'divider', bgcolor: 'background.paper' }}
              />
            )}
            <Box sx={{ flexGrow: 1 }} />
            <NotificationBell />
            <Tooltip title="Account">
              <Box
                component="button"
                onClick={e => setAccountAnchor(e.currentTarget)}
                aria-label="Account menu"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, border: 0, bgcolor: 'transparent', cursor: 'pointer', borderRadius: 99, p: 0.5, pr: { xs: 0.5, sm: 1 }, color: 'inherit', font: 'inherit', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Avatar sx={{ width: 34, height: 34, bgcolor: BRAND_FILL, fontSize: 14, fontWeight: 700 }}>
                  {initials(adminName, adminEmail)}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', lineHeight: 1.2 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, maxWidth: 160 }} noWrap>{adminName || adminEmail || 'Admin'}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{roleLabel}</Typography>
                </Box>
                <KeyboardArrowDown sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 18, color: 'text.secondary' }} />
              </Box>
            </Tooltip>
            <Menu
              anchorEl={accountAnchor}
              open={Boolean(accountAnchor)}
              onClose={() => setAccountAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
            >
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography sx={{ fontWeight: 700 }}>{adminName || 'Admin'}</Typography>
                {adminEmail && <Typography variant="body2" color="text.secondary">{adminEmail}</Typography>}
                <Typography variant="caption" color="text.secondary">{roleLabel}{!superAdmin && businessName ? ` · ${businessName}` : ''}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAccountAnchor(null); navigate('/businesses'); }}>
                <ListItemIcon><StorefrontOutlined fontSize="small" /></ListItemIcon>
                {superAdmin ? 'Businesses' : 'My business'}
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2.5, md: 3 }, overflow: 'auto', width: '100%', maxWidth: 1480, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
