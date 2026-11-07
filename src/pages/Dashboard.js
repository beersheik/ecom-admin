import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, CircularProgress, Chip, Fade, Divider, Button,
  ButtonBase, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton
} from '@mui/material';
import {
  ShoppingBag, People, Inventory2, CurrencyRupee, AddCircleOutline, CampaignOutlined,
  QrCode2, LocalShippingOutlined, CurrencyExchange, WarningAmberRounded, RemoveShoppingCartOutlined,
  ChevronRight, TaskAlt, ArrowForward
} from '@mui/icons-material';
import api from '../api';
import ResponsiveTable from '../components/ResponsiveTable';
import { isSuperAdmin } from '../auth';
import { cardSx, BRAND, INK, SAFFRON, SERIF_NUMS } from '../theme';

const STATUS_COLOR = { paid: 'success', pending: 'warning', verifying: 'info', failed: 'error', refunded: 'default' };
const STATUS_LABEL = { verifying: 'Check UPI' };
const LOW_STOCK = 5;
const TO_SHIP = ['placed', 'confirmed', 'packed'];

const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const isToday = (d) => new Date(d).toDateString() === new Date().toDateString();

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// Flat stat card: white with a hairline border; the coloured icon tile carries the accent.
function StatCard({ label, value, hint, icon, accent, iconColor = '#fff', loading, to }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={{
        width: '100%', p: 2.5, borderRadius: 3, textAlign: 'left', justifyContent: 'flex-start',
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', color: 'text.primary',
        display: 'flex', alignItems: 'center', gap: 2,
        transition: 'border-color 150ms ease-out, transform 150ms ease-out',
        '&:hover': { borderColor: INK, transform: 'translateY(-2px)' },
        '&:focus-visible': { outline: `2px solid ${BRAND.main}`, outlineOffset: 2 },
      }}
    >
      <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {React.cloneElement(icon, { sx: { fontSize: 24, color: iconColor } })}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
        {loading
          ? <Skeleton variant="text" width={70} sx={{ fontSize: 28 }} />
          : <Typography sx={{ ...SERIF_NUMS, fontSize: 30, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{value}</Typography>}
        {hint && !loading && <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{hint}</Typography>}
      </Box>
    </ButtonBase>
  );
}

// Things that need a person to act, each linking to where it's done.
function NeedsAttention({ tasks, loading }) {
  const open = tasks.filter(t => t.count > 0);
  return (
    <Paper elevation={0} sx={{ ...cardSx, height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h6">Needs attention</Typography>
        <Typography variant="body2" color="text.secondary">What's waiting on you right now</Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box sx={{ p: 2 }}>{[0, 1, 2].map(i => <Skeleton key={i} height={44} />)}</Box>
      ) : open.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          <TaskAlt sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>All caught up</Typography>
          <Typography variant="body2">No payments to check, orders to ship or stock to refill.</Typography>
        </Box>
      ) : (
        <List disablePadding>
          {open.map(t => (
            <ListItem key={t.label} disablePadding>
            <ListItemButton component={RouterLink} to={t.to} sx={{ py: 1.25, px: 2.5 }}>
              <ListItemIcon sx={{ minWidth: 44 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', color: `${t.color}.main`, bgcolor: (th) => `${th.palette[t.color].main}1a` }}>
                  {React.cloneElement(t.icon, { sx: { fontSize: 18 } })}
                </Box>
              </ListItemIcon>
              <ListItemText primary={t.label} secondary={t.hint} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12.5 }} />
              <Chip label={t.count} size="small" color={t.color} sx={{ mr: 0.5 }} />
              <ChevronRight sx={{ color: 'text.secondary' }} />
            </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

const Dashboard = () => {
  const superAdmin = isSuperAdmin();
  const adminName = (localStorage.getItem('adminName') || '').split(' ')[0];
  const businessName = localStorage.getItem('businessName');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = (r) => (Array.isArray(r.data) ? r.data : []);
    Promise.all([
      api.get('/api/payments/admin/all-orders').then(list).catch(() => []),
      api.get('/api/products').then(list).catch(() => []),
      api.get('/api/users').then(list).catch(() => []),
    ]).then(([o, p, u]) => { setOrders(o); setProducts(p); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const paid = orders.filter(o => o.status === 'paid');
  const revenue = paid.reduce((sum, o) => sum + (o.amount || 0), 0);
  const ordersToday = orders.filter(o => isToday(o.createdAt) && o.status !== 'failed').length;
  const active = (o) => o.fulfillmentStatus !== 'cancelled';

  const tasks = [
    { label: 'UPI payments to check', hint: 'Match the UTR with your bank', icon: <QrCode2 />, color: 'info', to: '/orders',
      count: orders.filter(o => active(o) && o.paymentMethod === 'upi' && ['pending', 'verifying'].includes(o.status) && o.upiRef).length },
    { label: 'Orders to ship', hint: 'Paid and not yet shipped', icon: <LocalShippingOutlined />, color: 'primary', to: '/orders',
      count: paid.filter(o => TO_SHIP.includes(o.fulfillmentStatus || 'placed')).length },
    { label: 'Refunds to do manually', hint: 'Cancelled orders the customer paid for', icon: <CurrencyExchange />, color: 'error', to: '/orders',
      count: orders.filter(o => o.refundFailed).length },
    { label: 'Out of stock', hint: 'Customers cannot buy these', icon: <RemoveShoppingCartOutlined />, color: 'error', to: '/products',
      count: products.filter(p => p.status === 'active' && !(p.stock > 0)).length },
    { label: 'Low stock', hint: `${LOW_STOCK} or fewer left`, icon: <WarningAmberRounded />, color: 'warning', to: '/products',
      count: products.filter(p => p.status === 'active' && p.stock > 0 && p.stock <= LOW_STOCK).length },
  ];

  return (
    <Fade in timeout={400}>
      <Box>
        {/* Greeting + quick actions */}
        <Box sx={{ display: 'flex', alignItems: { sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: 28, sm: 36 }, lineHeight: 1.1 }}>
              {greeting()}{adminName ? `, ${adminName}` : ''}
            </Typography>
            <Typography color="text.secondary">
              Here's how {superAdmin ? 'all businesses are' : `${businessName || 'your store'} is`} doing today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/products?new=1" variant="contained" startIcon={<AddCircleOutline />}>Add product</Button>
            <Button component={RouterLink} to="/announcements" variant="outlined" startIcon={<CampaignOutlined />}>Announce</Button>
          </Box>
        </Box>

        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Orders', value: orders.length, hint: `${ordersToday} today`, icon: <ShoppingBag />, accent: BRAND.main, to: '/orders' },
            { label: 'Revenue (paid)', value: rupees(revenue), hint: `${paid.length} paid order${paid.length === 1 ? '' : 's'}`, icon: <CurrencyRupee />, accent: '#0369A1', to: '/orders' },
            { label: 'Products', value: products.length, hint: `${products.filter(p => p.status === 'active').length} active`, icon: <Inventory2 />, accent: SAFFRON, iconColor: INK, to: '/products' },
            { label: 'Customers', value: users.length, hint: 'registered shoppers', icon: <People />, accent: INK, to: '/users' },
          ].map(card => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <NeedsAttention tasks={tasks} loading={loading} />
          </Grid>

          {/* Recent orders */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box>
                  <Typography variant="h6">Recent orders</Typography>
                  <Typography variant="body2" color="text.secondary">Latest 6 orders{superAdmin ? ' across all businesses' : ''}</Typography>
                </Box>
                <Button component={RouterLink} to="/orders" endIcon={<ArrowForward />} size="small">View all</Button>
              </Box>
              <Divider />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
              ) : orders.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <ShoppingBag sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>No orders yet</Typography>
                  <Typography variant="body2">Orders will appear here as soon as customers check out.</Typography>
                </Box>
              ) : (
                <ResponsiveTable
                  rows={orders.slice(0, 6)}
                  columns={[
                    { label: 'Order', render: o => `#${o._id?.slice(-8).toUpperCase()}`, cellSx: { fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' } },
                    // A business admin only sees their own business, so the column would repeat one name.
                    ...(superAdmin ? [{ label: 'Business', render: o => o.business?.name || '—' }] : []),
                    { label: 'Customer', primary: true, render: o => o.user?.name || o.user?.email || '—' },
                    { label: 'Amount', align: 'right', render: o => rupees(o.amount), cellSx: { fontWeight: 600 } },
                    { label: 'Status', render: o => (
                      <Chip label={STATUS_LABEL[o.status] || o.status} color={STATUS_COLOR[o.status] || 'default'} size="small" sx={{ textTransform: 'capitalize', fontSize: 11.5 }} />
                    ) },
                    { label: 'Date', render: o => new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), cellSx: { color: 'text.secondary', fontSize: 12.5 } }
                  ]}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard;
