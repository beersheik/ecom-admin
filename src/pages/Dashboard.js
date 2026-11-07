import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, CircularProgress,
  Chip, Fade, Divider
} from '@mui/material';
import {
  ShoppingBag, People, Inventory2, CurrencyRupee
} from '@mui/icons-material';
import api from '../api';
import ResponsiveTable from '../components/ResponsiveTable';
import { isSuperAdmin } from '../auth';

const STATUS_COLOR = { paid: 'success', pending: 'warning', verifying: 'info', failed: 'error', refunded: 'default' };

function StatCard({ label, value, icon, gradient, loading }) {
  return (
    <Paper elevation={0} sx={{
      p: 3, borderRadius: 3,
      background: gradient,
      color: '#fff',
      display: 'flex', alignItems: 'center', gap: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
    }}>
      <Box sx={{
        width: 52, height: 52, borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 26, color: '#fff' } })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>{label}</Typography>
        {loading ? (
          <CircularProgress size={20} sx={{ color: '#fff', mt: 0.5 }} />
        ) : (
          <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
        )}
      </Box>
    </Paper>
  );
}

const Dashboard = () => {
  const superAdmin = isSuperAdmin();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/payments/admin/all-orders').then(r => r.data).catch(() => []),
      api.get('/api/products').then(r => r.data).catch(() => []),
      api.get('/api/users').then(r => r.data).catch(() => []),
    ]).then(([orders, products, users]) => {
      const revenue = (Array.isArray(orders) ? orders : [])
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      setStats({
        orders: Array.isArray(orders) ? orders.length : 0,
        revenue,
        products: Array.isArray(products) ? products.length : 0,
        users: Array.isArray(users) ? users.length : 0,
      });
      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 6) : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Fade in timeout={500}>
      <Box>
        {/* Stat Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: 'Total Orders',   value: stats.orders,             icon: <ShoppingBag />,    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
            { label: 'Revenue (Paid)', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: <CurrencyRupee />, gradient: 'linear-gradient(135deg,#10b981,#059669)' },
            { label: 'Products',       value: stats.products,           icon: <Inventory2 />,     gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
            { label: 'Users',          value: stats.users,              icon: <People />,         gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
          ].map(card => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
              <StatCard {...card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* Recent Orders */}
        <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Orders</Typography>
            <Typography variant="body2" color="text.secondary">Latest 6 orders{superAdmin ? ' across all businesses' : ''}</Typography>
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : recentOrders.length === 0 ? (
            <Typography sx={{ p: 3, color: 'text.secondary' }}>No orders yet.</Typography>
          ) : (
            <ResponsiveTable
              rows={recentOrders}
              headSx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}
              columns={[
                { label: 'Order ID', render: o => o._id?.slice(-8), cellSx: { fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' } },
                // A business admin only sees their own business, so the column would repeat one name.
                ...(superAdmin ? [{ label: 'Business', render: o => o.business?.name || '—' }] : []),
                { label: 'Customer', primary: true, render: o => o.user?.name || o.user?.email || '—' },
                { label: 'Amount', align: 'right', render: o => `₹${o.amount}`, cellSx: { fontWeight: 600 } },
                { label: 'Status', render: o => (
                  <Chip
                    label={o.status}
                    color={STATUS_COLOR[o.status] || 'default'}
                    size="small"
                    sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 11 }}
                  />
                ) },
                { label: 'Date', render: o => new Date(o.createdAt).toLocaleDateString(), cellSx: { color: 'text.secondary', fontSize: 12 } }
              ]}
            />
          )}
        </Paper>
      </Box>
    </Fade>
  );
};

export default Dashboard;
