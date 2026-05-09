import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, StorefrontRounded } from '@mui/icons-material';
import api from '../api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('business', data.business?._id || '');
      localStorage.setItem('businessName', data.business?.name || '');
      window.location.href = '/dashboard';
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel – branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        px: 6, gap: 3,
      }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 3,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
        }}>
          <StorefrontRounded sx={{ color: '#fff', fontSize: 40 }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
            Ecom Admin
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, maxWidth: 280 }}>
            Manage your store, products, orders, and payments — all in one place.
          </Typography>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 300 }}>
          {['Product & Category Management', 'Order Tracking', 'Razorpay Payments', 'Multi-business Support'].map(f => (
            <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#818cf8', flexShrink: 0 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5 }}>{f}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right panel – form */}
      <Box sx={{
        flex: { xs: 1, md: 'none' },
        width: { md: 440 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        px: { xs: 3, md: 6 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 360 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <StorefrontRounded sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Ecom Admin</Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Welcome back</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3.5, fontSize: 14 }}>
            Sign in to your admin account
          </Typography>

          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                fullWidth required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
                }}
              />
              <TextField
                label="Password"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                fullWidth required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass(s => !s)} edge="end">
                        {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.4, fontWeight: 700, fontSize: 15, borderRadius: 2,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                  '&:hover': { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign in'}
              </Button>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
