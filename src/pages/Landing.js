import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography, Chip } from '@mui/material';
import {
  ArrowForward, Inventory2Outlined, LocalShippingOutlined, QrCode2, NotificationsActiveOutlined,
  InstallMobileOutlined, AdminPanelSettingsOutlined, StorefrontOutlined, CheckCircle, LoginOutlined
} from '@mui/icons-material';
import BrandMark from '../components/BrandMark';
import { STEPS, StoresDiagram, FLOOR_PLAN_BG } from '../components/EmallConcept';
import { Reveal, enter } from '../components/motion';
import { APP_NAME, BRAND, INK, LINE, PAPER, SAFFRON, SERIF, SERIF_NUMS, SIDEBAR, cardSx } from '../theme';

const FEATURES = [
  { icon: <Inventory2Outlined />, title: 'Products & offers', body: 'Photos, prices, stock, categories and "3 for ₹600" multi-buy offers.' },
  { icon: <LocalShippingOutlined />, title: 'Orders & delivery', body: 'Track every order from paid to delivered, with courier and tracking numbers.' },
  { icon: <QrCode2 />, title: 'Razorpay or direct UPI', body: 'Take cards and UPI through Razorpay, or let customers pay your UPI ID directly.' },
  { icon: <NotificationsActiveOutlined />, title: 'Customer updates', body: 'Phone notifications and emails when orders move, plus announcements for sales.' },
  { icon: <InstallMobileOutlined />, title: 'A store app for shoppers', body: 'Each store installs on phones like an app and keeps working with a weak connection.' },
  { icon: <AdminPanelSettingsOutlined />, title: 'Safe for many businesses', body: 'Each business sees only its own products, orders, customers and payments.' },
];

const ROLES = [
  {
    icon: <AdminPanelSettingsOutlined />, title: 'Super admin', tag: 'Runs the mall',
    points: ['Sees every store in one place', 'Adds businesses and their admins', 'Turns on offers and direct UPI per business'],
  },
  {
    icon: <StorefrontOutlined />, title: 'Store admin', tag: 'Runs one store',
    points: ['Manages their own products and prices', 'Handles their own orders and payments', 'Talks to their own customers'],
  },
];

const signedIn = () => Boolean(localStorage.getItem('token'));

// The public front door of the eMall admin: explains the idea, then sends people to
// sign in, or straight to their own admin if they already are.
const Landing = () => {
  const loggedIn = signedIn();
  const name = (localStorage.getItem('adminName') || '').split(' ')[0];
  const business = localStorage.getItem('businessName');
  const role = localStorage.getItem('role');

  const cta = loggedIn
    ? { to: '/dashboard', label: 'Open my admin', icon: <ArrowForward /> }
    : { to: '/login', label: 'Sign in', icon: <LoginOutlined /> };

  const ctaButton = (size = 'large', extraSx = {}) => (
    <Button
      component={RouterLink}
      to={cta.to}
      size={size}
      variant="contained"
      endIcon={cta.icon}
      sx={{ px: 3, '&:hover': { bgcolor: BRAND.dark }, ...extraSx }}
    >
      {cta.label}
    </Button>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Top bar */}
      <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: INK, borderBottom: '1px solid rgba(250,247,242,0.08)' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
          <BrandMark size={34} />
          <Box sx={{ flexGrow: 1 }} />
          <Box component="nav" sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
            {[['How it works', '#how'], ['Features', '#features'], ['Who it\'s for', '#roles']].map(([label, href]) => (
              <Button key={href} href={href} sx={{ color: 'rgba(250,247,242,0.78)', '&:hover': { color: PAPER, bgcolor: 'rgba(250,247,242,0.06)' } }}>{label}</Button>
            ))}
          </Box>
          {ctaButton('medium', { px: 2 })}
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ bgcolor: INK, backgroundImage: FLOOR_PLAN_BG, backgroundSize: '240px 240px', color: PAPER, overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              {loggedIn && (
                <Chip
                  icon={<CheckCircle sx={{ color: `${SIDEBAR.activeText} !important` }} />}
                  label={`Signed in${name ? ` as ${name}` : ''}${role === 'superadmin' ? ' · Super admin' : business ? ` · ${business}` : ''}`}
                  sx={{ mb: 3, bgcolor: 'rgba(250,247,242,0.06)', color: PAPER, border: '1px solid rgba(250,247,242,0.16)', ...enter(0) }}
                />
              )}
              <Typography component="h1" sx={{ fontFamily: SERIF, fontSize: { xs: 40, sm: 52, md: 62 }, fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.025em', ...enter(100) }}>
                One mall.<br />Many <Box component="span" sx={{ color: SAFFRON, fontStyle: 'italic' }}>online stores.</Box>
              </Typography>
              <Typography sx={{ mt: 2.5, fontSize: { xs: 16, md: 18 }, color: 'rgba(250,247,242,0.72)', maxWidth: 520, lineHeight: 1.6, ...enter(250) }}>
                {APP_NAME} gives every business its own online store, with its own products, payments and customers, and lets you run all of them from one admin.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap', ...enter(400) }}>
                {ctaButton()}
                <Button href="#how" size="large" sx={{ color: PAPER, border: '1px solid rgba(250,247,242,0.28)', px: 3, '&:hover': { bgcolor: 'rgba(250,247,242,0.06)', borderColor: PAPER } }}>
                  See how it works
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StoresDiagram animate delay={300} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works */}
      <Container id="how" maxWidth="lg" sx={{ py: { xs: 7, md: 10 }, scrollMarginTop: 64 }}>
        <SectionTitle eyebrow="How it works" title="Three ideas, that's all" />
        <Grid container spacing={2.5}>
          {STEPS.map((step, i) => (
            <Grid key={step.title} size={{ xs: 12, md: 4 }}>
              <Reveal delay={i * 120} sx={{ height: '100%' }}>
              <Paper elevation={0} sx={{ ...cardSx, p: 3, height: '100%', transition: 'transform .25s ease, border-color .25s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: INK } }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: INK, color: SAFFRON, display: 'grid', placeItems: 'center', ...SERIF_NUMS, fontWeight: 700, fontSize: 18, mb: 2 }}>{i + 1}</Box>
                <Typography sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: 21, lineHeight: 1.25, mb: 0.75 }}>{step.title}</Typography>
                <Typography color="text.secondary">{step.body}</Typography>
              </Paper>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features */}
      <Box id="features" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <SectionTitle eyebrow="Features" title="Everything a store needs" />
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {FEATURES.map((f, i) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Reveal delay={(i % 3) * 110}>
                <Box sx={{ display: 'flex', gap: 2, '&:hover .feature-icon': { transform: 'translateY(-3px) rotate(-6deg)', bgcolor: 'primary.main', color: '#fff' } }}>
                  <Box className="feature-icon" sx={{ width: 44, height: 44, borderRadius: 2.5, flexShrink: 0, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'rgba(4,120,87,0.08)', border: `1px solid ${LINE}`, transition: 'transform .25s ease, background-color .25s ease, color .25s ease' }}>{f.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.body}</Typography>
                  </Box>
                </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Roles */}
      <Container id="roles" maxWidth="lg" sx={{ py: { xs: 7, md: 10 }, scrollMarginTop: 64 }}>
        <SectionTitle eyebrow="Who it's for" title="One login, the right view for each person" />
        <Grid container spacing={2.5}>
          {ROLES.map((r, i) => (
            <Grid key={r.title} size={{ xs: 12, md: 6 }}>
              <Reveal delay={i * 140} sx={{ height: '100%' }}>
              <Paper elevation={0} sx={{ ...cardSx, p: 3.5, height: '100%', transition: 'transform .25s ease, border-color .25s ease', '&:hover': { transform: 'translateY(-4px)', borderColor: INK } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: 'grid', placeItems: 'center', color: SAFFRON, bgcolor: INK }}>{r.icon}</Box>
                  <Box>
                    <Typography sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, lineHeight: 1.2 }}>{r.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.tag}</Typography>
                  </Box>
                </Box>
                {r.points.map(p => (
                  <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 0.6 }}>
                    <CheckCircle sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography>{p}</Typography>
                  </Box>
                ))}
              </Paper>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Closing call to action */}
      <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
        <Reveal>
        <Box sx={{ borderRadius: 4, p: { xs: 4, md: 6 }, textAlign: 'center', color: PAPER, bgcolor: INK, backgroundImage: FLOOR_PLAN_BG, backgroundSize: '240px 240px' }}>
          <Typography sx={{ fontFamily: SERIF, fontSize: { xs: 28, md: 38 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {loggedIn ? 'Pick up where you left off' : 'Ready to run your store?'}
          </Typography>
          <Typography sx={{ mt: 1, mb: 3.5, color: 'rgba(250,247,242,0.72)' }}>
            {loggedIn
              ? 'Your dashboard shows what needs attention right now.'
              : 'Sign in with the account your eMall admin created for you. You\'ll land straight in your own store\'s admin.'}
          </Typography>
          {ctaButton()}
        </Box>
        </Reveal>
      </Container>

      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <BrandMark size={26} nameColor={INK} />
          <Typography variant="body2" color="text.secondary">© {new Date().getFullYear()} {APP_NAME}. One mall, many online stores.</Typography>
        </Container>
      </Box>
    </Box>
  );
};

function SectionTitle({ eyebrow, title }) {
  return (
    <Reveal sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
      <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{eyebrow}</Typography>
      <Typography component="h2" sx={{ mt: 1, fontFamily: SERIF, fontSize: { xs: 30, md: 42 }, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</Typography>
    </Reveal>
  );
}

export default Landing;
