import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme, useMediaQuery, Paper, Box, Fade, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Avatar, Switch, Tooltip } from '@mui/material';
import { Edit, Delete, Payment, Store, QrCode2 } from '@mui/icons-material';
import api from '../api';
import { isSuperAdmin } from '../auth';
import ResponsiveTable from '../components/ResponsiveTable';
import { cardSx } from '../theme';

const BASE = process.env.REACT_APP_API_HOST;

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE}/${imagePath}`;
};

// Sends text fields plus the logo file (only when a new one was picked)
const toFormData = (values, logoFile) => {
  const formData = new FormData();
  ['name', 'address', 'email', 'phone'].forEach(f => formData.append(f, values[f] || ''));
  if (logoFile) formData.append('logo', logoFile);
  return formData;
};

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

const BusinessLogo = ({ business }) => (
  <Avatar src={getImageUrl(business.logo) || undefined} alt={business.name} variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.200', color: 'grey.500' }}>
    <Store fontSize="small" />
  </Avatar>
);

const Business = () => {
  const superAdmin = isSuperAdmin();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', email: '', phone: '' });
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiForm, setUpiForm] = useState({ vpa: '', payeeName: '' });
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayForm, setRazorpayForm] = useState({ keyId: '', keySecret: '' });
  const { enqueueSnackbar } = useSnackbar();

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/businesses');
      setBusinesses(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

  useEffect(() => () => { if (logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview); }, [logoPreview]);

  const resetLogo = (existing = '') => {
    setLogoFile(null);
    setLogoPreview(getImageUrl(existing));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please choose an image file', { variant: 'error' });
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      enqueueSnackbar('Logo must be 2MB or smaller', { variant: 'error' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const logoField = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, mb: 2 }}>
      <Avatar src={logoPreview || undefined} variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'grey.200', color: 'grey.500' }}>
        <Store />
      </Avatar>
      <Box>
        <Button variant="outlined" component="label" size="small" disabled={saving} sx={{ fontWeight: 600 }}>
          {logoPreview ? 'Change Logo' : 'Upload Logo'}
          <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} />
        </Button>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
          JPG, PNG or WEBP, max 2MB
        </Typography>
      </Box>
    </Box>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/businesses', toFormData(form, logoFile));
      fetchBusinesses();
      setOpen(false);
      setForm({ name: '', address: '', email: '', phone: '' });
      resetLogo();
      enqueueSnackbar('Business added successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/businesses/${selectedBusiness._id}`, toFormData(editForm, logoFile));
      fetchBusinesses();
      setEditOpen(false);
      enqueueSnackbar('Business updated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRazorpayOpen = (business) => {
    setSelectedBusiness(business);
    setRazorpayForm({ keyId: business.payments?.razorpay?.keyId || '', keySecret: business.payments?.razorpay?.keySecret || '' });
    setRazorpayOpen(true);
  };

  const handleRazorpaySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/businesses/${selectedBusiness._id}/razorpay`, razorpayForm);
      fetchBusinesses();
      setRazorpayOpen(false);
      enqueueSnackbar('Razorpay credentials updated!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  // Super admin switches: offersEnabled (multi-buy offers) and upiEnabled (direct UPI payments)
  const handleFeatureToggle = async (business, key, label) => {
    const enabled = !business[key];
    setBusinesses(prev => prev.map(b => (b._id === business._id ? { ...b, [key]: enabled } : b)));
    try {
      await api.put(`/api/businesses/${business._id}/features`, { [key]: enabled });
      enqueueSnackbar(`${label} ${enabled ? 'turned on' : 'turned off'} for ${business.name}`, { variant: 'success' });
    } catch (err) {
      setBusinesses(prev => prev.map(b => (b._id === business._id ? { ...b, [key]: !enabled } : b)));
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleUpiOpen = (business) => {
    setSelectedBusiness(business);
    setUpiForm({ vpa: business.payments?.upi?.vpa || '', payeeName: business.payments?.upi?.payeeName || business.name || '' });
    setUpiOpen(true);
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/businesses/${selectedBusiness._id}/upi`, upiForm);
      fetchBusinesses();
      setUpiOpen(false);
      enqueueSnackbar('UPI details updated!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/businesses/${selectedBusiness._id}`);
      fetchBusinesses();
      setDeleteOpen(false);
      enqueueSnackbar('Business deleted successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  return (
    <Box>
      <Fade in timeout={600}>
        <Paper elevation={0} sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: isMobile ? 1.5 : 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ flexGrow: 1 }} gutterBottom>
              {superAdmin ? 'Businesses' : 'My Business'}
            </Typography>
            {superAdmin && (
              <Button variant="contained" color="primary" onClick={() => { resetLogo(); setOpen(true); }} sx={{ fontWeight: 600 }}>Add Business</Button>
            )}
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}><CircularProgress /></Box>
          ) : businesses.length === 0 ? (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
              <Typography>No businesses found. Click "Add Business" to get started.</Typography>
            </Box>
          ) : (
            <ResponsiveTable
              cardsBelow="lg"
              rows={businesses}
              columns={[
                { label: 'Logo', hideOnMobile: true, render: b => <BusinessLogo business={b} /> },
                { label: 'Business', primary: true, hideOnDesktop: true, render: b => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><BusinessLogo business={b} /><span>{b.name}</span></Box>
                ) },
                { label: 'Name', hideOnMobile: true, render: b => b.name },
                { label: 'Address', render: b => b.address || '—' },
                { label: 'Email', render: b => b.email },
                { label: 'Phone', render: b => b.phone || '—' },
                { label: 'Multi-buy offers', align: 'center', render: b => (superAdmin ? (
                  <Tooltip title={b.offersEnabled ? 'Turn off "3 for ₹X" offers' : 'Allow "3 for ₹X" offers on this business\'s products'}>
                    <Switch checked={Boolean(b.offersEnabled)} onChange={() => handleFeatureToggle(b, 'offersEnabled', 'Multi-buy offers')} color="success" inputProps={{ 'aria-label': `Multi-buy offers for ${b.name}` }} />
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color={b.offersEnabled ? 'success.main' : 'text.secondary'}>{b.offersEnabled ? 'On' : 'Off'}</Typography>
                )) },
                { label: 'Direct UPI', align: 'center', render: b => (superAdmin ? (
                  <Tooltip title={b.upiEnabled ? 'Turn off direct UPI payments' : 'Let customers pay this business\'s UPI ID directly (no gateway)'}>
                    <Switch checked={Boolean(b.upiEnabled)} onChange={() => handleFeatureToggle(b, 'upiEnabled', 'Direct UPI payments')} color="success" inputProps={{ 'aria-label': `Direct UPI payments for ${b.name}` }} />
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color={b.upiEnabled ? 'success.main' : 'text.secondary'}>{b.upiEnabled ? 'On' : 'Off'}</Typography>
                )) }
              ]}
              actions={b => (
                <>
                  <Button size="small" color="primary" onClick={() => { setSelectedBusiness(b); setEditForm({ name: b.name, address: b.address, email: b.email, phone: b.phone }); resetLogo(b.logo); setEditOpen(true); }} startIcon={<Edit />}>Edit</Button>
                  <Button size="small" color="success" onClick={() => handleRazorpayOpen(b)} startIcon={<Payment />}>Razorpay</Button>
                  {b.upiEnabled && (
                    <Button size="small" color="secondary" onClick={() => handleUpiOpen(b)} startIcon={<QrCode2 />}>UPI</Button>
                  )}
                  {superAdmin && (
                    <Button size="small" color="error" onClick={() => { setSelectedBusiness(b); setDeleteOpen(true); }} startIcon={<Delete />}>Delete</Button>
                  )}
                </>
              )}
            />
          )}

          {/* Add — superadmin only */}
          <Dialog open={superAdmin && open} onClose={() => !saving && setOpen(false)} fullScreen={isMobile} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>Add Business</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit} id="business-form">
                {logoField}
                {['name','address','email','phone'].map(f => (
                  <TextField key={f} margin="dense" label={f.charAt(0).toUpperCase()+f.slice(1)} name={f} value={form[f]} onChange={e => setForm(p => ({...p, [f]: e.target.value}))} fullWidth required={['name','email'].includes(f)} sx={{ mb: 2 }} />
                ))}
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)} disabled={saving} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="business-form" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null} sx={{ fontWeight: 600 }}>
                {saving ? (logoFile ? 'Uploading...' : 'Saving...') : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit */}
          <Dialog open={editOpen} onClose={() => !saving && setEditOpen(false)} fullScreen={isMobile} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>Edit Business</DialogTitle>
            <DialogContent>
              <form onSubmit={handleEditSubmit} id="edit-business-form">
                {logoField}
                {['name','address','email','phone'].map(f => (
                  <TextField key={f} margin="dense" label={f.charAt(0).toUpperCase()+f.slice(1)} name={f} value={editForm[f]} onChange={e => setEditForm(p => ({...p, [f]: e.target.value}))} fullWidth required={['name','email'].includes(f)} sx={{ mb: 2 }} />
                ))}
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setEditOpen(false)} disabled={saving} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="edit-business-form" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null} sx={{ fontWeight: 600 }}>
                {saving ? (logoFile ? 'Uploading...' : 'Updating...') : 'Update'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Razorpay */}
          <Dialog open={razorpayOpen} onClose={() => setRazorpayOpen(false)} fullScreen={isMobile} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>Razorpay Credentials — {selectedBusiness?.name}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleRazorpaySubmit} id="razorpay-form">
                <TextField margin="dense" label="Key ID" name="keyId" value={razorpayForm.keyId} onChange={e => setRazorpayForm(p => ({...p, keyId: e.target.value}))} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Key Secret" name="keySecret" value={razorpayForm.keySecret} onChange={e => setRazorpayForm(p => ({...p, keySecret: e.target.value}))} fullWidth required type="password" />
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setRazorpayOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="razorpay-form" variant="contained" color="success" sx={{ fontWeight: 600 }}>Save</Button>
            </DialogActions>
          </Dialog>

          {/* Direct UPI */}
          <Dialog open={upiOpen} onClose={() => setUpiOpen(false)} fullScreen={isMobile} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>UPI Details — {selectedBusiness?.name}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Customers pay this UPI ID from their own app and enter the UTR. Check each UTR against your bank or UPI app before confirming it on the Orders page. A business/merchant UPI ID works more reliably than a personal one.
              </Typography>
              <form onSubmit={handleUpiSubmit} id="upi-form">
                <TextField margin="dense" label="UPI ID" placeholder="yourshop@okaxis" value={upiForm.vpa} onChange={e => setUpiForm(p => ({ ...p, vpa: e.target.value }))} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Payee name" helperText="Shown in the customer's UPI app" value={upiForm.payeeName} onChange={e => setUpiForm(p => ({ ...p, payeeName: e.target.value }))} fullWidth required inputProps={{ maxLength: 50 }} />
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setUpiOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="upi-form" variant="contained" color="secondary" sx={{ fontWeight: 600 }}>Save</Button>
            </DialogActions>
          </Dialog>

          {/* Delete */}
          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>Delete Business</DialogTitle>
            <DialogContent><Typography>Delete <b>{selectedBusiness?.name}</b>?</Typography></DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDeleteOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ fontWeight: 600 }}>Delete</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Business;
