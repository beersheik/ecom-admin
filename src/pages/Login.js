import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress, InputAdornment, IconButton,
  Alert, Checkbox, FormControlLabel, Link, Collapse, Fade
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, ArrowForward, ArrowBack, HelpOutline, VerifiedUserOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';
import BrandMark from '../components/BrandMark';
import { STEPS, StoresDiagram, FLOOR_PLAN_BG } from '../components/EmallConcept';
import { APP_NAME, BRAND, INK, PAPER, SAFFRON, SERIF, SERIF_NUMS } from '../theme';

const REMEMBER_KEY = 'emallLoginEmail';

const Login = () => {
  const remembered = localStorage.getItem(REMEMBER_KEY) || '';
  const [form, setForm] = useState({ email: remembered, password: '' });
  const [remember, setRemember] = useState(Boolean(remembered));
  const [showPass, setShowPass] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (error) setError('');
  };
  const watchCaps = (e) => setCapsLock(Boolean(e.getModifierState && e.getModifierState('CapsLock')));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/admin/login', { email: form.email.trim(), password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('business', data.business?._id || '');
      localStorage.setItem('businessName', data.business?.name || '');
      localStorage.setItem('adminName', data.name || '');
      localStorage.setItem('adminEmail', data.email || '');
      if (remember) localStorage.setItem(REMEMBER_KEY, form.email.trim());
      else localStorage.removeItem(REMEMBER_KEY);
      window.location.href = '/dashboard';
    } catch (err) {
      const status = err.response?.status;
      setError(status === 401 || status === 400
        ? 'That email and password don\'t match. Check them and try again.'
        : !err.response
          ? 'Can\'t reach the server. Check your internet connection and try again.'
          : err.response?.data?.message || 'Something went wrong. Please try again.');
      setForm(f => ({ ...f, password: '' }));
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel – what eMall is */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: INK, backgroundImage: FLOOR_PLAN_BG, backgroundSize: '240px 240px',
        px: { md: 6, lg: 10 }, py: 6,
      }}>
        <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%' }}>
          <BrandMark size={44} />
          <Typography sx={{ color: PAPER, fontFamily: SERIF, fontSize: { md: 34, lg: 42 }, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em', mt: 4 }}>
            One mall. Many <Box component="span" sx={{ color: SAFFRON, fontStyle: 'italic' }}>online stores.</Box>
          </Typography>
          <Typography sx={{ color: 'rgba(250,247,242,0.72)', fontSize: 16, mt: 1.5, maxWidth: 480, lineHeight: 1.6 }}>
            {APP_NAME} hosts a separate online store for every business, and lets you run all of them from this one admin.
          </Typography>

          <StoresDiagram animate delay={200} />

          <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 4, display: 'grid', gap: 2.25 }}>
            {STEPS.map((step, i) => (
              <Box component="li" key={step.title} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', border: '1px solid rgba(250,247,242,0.2)', color: SAFFRON, ...SERIF_NUMS, fontWeight: 700, fontSize: 15 }}>
                  {i + 1}
                </Box>
                <Box>
                  <Typography sx={{ color: PAPER, fontWeight: 700, fontSize: 15 }}>{step.title}</Typography>
                  <Typography sx={{ color: 'rgba(250,247,242,0.66)', fontSize: 14, mt: 0.25 }}>{step.body}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel – form */}
      <Box sx={{
        flex: { xs: 1, md: 'none' },
        width: { md: 480 },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: PAPER,
        px: { xs: 3, sm: 6 },
      }}>
        <Fade in timeout={500}>
          <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto', my: 'auto', py: 5 }}>
            {/* Phones: logo and the idea in one line (the full explanation is on the left on wider screens) */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
              <BrandMark size={40} nameColor={INK} />
              <Typography sx={{ mt: 2, fontWeight: 700 }}>One mall. Many online stores.</Typography>
              <Typography variant="body2" color="text.secondary">
                Every business gets its own store; you run them all from here.
              </Typography>
            </Box>

            <Link component={RouterLink} to="/" underline="hover" variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2, color: 'text.secondary', fontWeight: 600 }}>
              <ArrowBack sx={{ fontSize: 16 }} /> Back to {APP_NAME} home
            </Link>
            <Typography sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.015em', mb: 0.75 }}>
              {remembered ? 'Welcome back' : `Sign in to ${APP_NAME}`}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 14.5 }}>
              Use the email and password your {APP_NAME} admin gave you.
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 3, sm: 3.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box component="form" onSubmit={handleSubmit} noValidate={false}>
                {error && (
                  <Alert severity="error" role="alert" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>
                )}
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus={!remembered}
                  value={form.email}
                  onChange={set('email')}
                  fullWidth required
                  error={Boolean(error)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
                  }}
                />
                <TextField
                  label="Password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoFocus={Boolean(remembered)}
                  value={form.password}
                  onChange={set('password')}
                  onKeyUp={watchCaps}
                  onKeyDown={watchCaps}
                  onBlur={() => setCapsLock(false)}
                  fullWidth required
                  error={Boolean(error)}
                  helperText={capsLock ? 'Caps Lock is on' : ' '}
                  FormHelperTextProps={{ sx: { color: 'warning.dark', fontWeight: 600, mx: 0.5 } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPass(s => !s)} edge="end" aria-label={showPass ? 'Hide password' : 'Show password'}>
                          {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 2, mt: 0.5, mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} />}
                    label={<Typography variant="body2" noWrap>Remember my email</Typography>}
                    sx={{ ml: -0.75 }}
                  />
                  <Link component="button" type="button" variant="body2" underline="hover" onClick={() => setHelpOpen(o => !o)} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Forgot password?
                  </Link>
                </Box>
                <Collapse in={helpOpen}>
                  <Alert severity="info" icon={<HelpOutline fontSize="inherit" />} sx={{ mb: 2, borderRadius: 2 }}>
                    There's no self-service reset yet. Ask your super admin to reset your password.
                  </Alert>
                </Collapse>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  endIcon={!loading && <ArrowForward />}
                  sx={{
                    py: 1.4, fontWeight: 700, fontSize: 15, borderRadius: 2.5,
                    '&:hover': { bgcolor: BRAND.dark },
                    '&.Mui-disabled': { bgcolor: 'primary.main', color: '#fff', opacity: 0.7 }
                  }}
                >
                  {loading ? <><CircularProgress size={18} sx={{ color: '#fff', mr: 1.25 }} />Signing in…</> : 'Sign in'}
                </Button>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 3, color: 'text.secondary' }}>
              <VerifiedUserOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption">Secure sign-in · Only authorised store admins</Typography>
            </Box>
          </Box>
        </Fade>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pb: 2 }}>
          © {new Date().getFullYear()} {APP_NAME}
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
