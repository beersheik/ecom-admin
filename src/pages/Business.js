import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme, useMediaQuery, Paper, Box, Fade, Typography, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider } from '@mui/material';
import { Edit, Delete, Payment } from '@mui/icons-material';
import api from '../api';
import { isSuperAdmin } from '../auth';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/businesses', form);
      fetchBusinesses();
      setOpen(false);
      setForm({ name: '', address: '', email: '', phone: '' });
      enqueueSnackbar('Business added successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/businesses/${selectedBusiness._id}`, editForm);
      fetchBusinesses();
      setEditOpen(false);
      enqueueSnackbar('Business updated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
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
    <Box sx={{ mt: isMobile ? 2 : 4 }}>
      <Fade in timeout={600}>
        <Paper elevation={isMobile ? 0 : 4} sx={{ borderRadius: 2, bgcolor: 'background.paper', boxShadow: isMobile ? 0 : 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: isMobile ? 1 : 2, justifyContent: 'space-between' }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ flexGrow: 1 }} gutterBottom>
              {superAdmin ? 'Businesses' : 'My Business'}
            </Typography>
            {superAdmin && (
              <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ fontWeight: 600 }}>Add Business</Button>
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
            <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell><TableCell>Address</TableCell>
                    <TableCell>Email</TableCell><TableCell>Phone</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businesses.map((b) => (
                    <TableRow key={b._id} hover>
                      <TableCell>{b.name}</TableCell><TableCell>{b.address}</TableCell>
                      <TableCell>{b.email}</TableCell><TableCell>{b.phone}</TableCell>
                      <TableCell align="right">
                        <Button size="small" color="primary" onClick={() => { setSelectedBusiness(b); setEditForm({ name: b.name, address: b.address, email: b.email, phone: b.phone }); setEditOpen(true); }} startIcon={<Edit />} sx={{ mr: 1 }}>Edit</Button>
                        <Button size="small" color="success" onClick={() => handleRazorpayOpen(b)} startIcon={<Payment />} sx={{ mr: superAdmin ? 1 : 0 }}>Razorpay</Button>
                        {superAdmin && (
                          <Button size="small" color="error" onClick={() => { setSelectedBusiness(b); setDeleteOpen(true); }} startIcon={<Delete />}>Delete</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Add — superadmin only */}
          <Dialog open={superAdmin && open} onClose={() => setOpen(false)} fullScreen={isMobile} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>Add Business</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit} id="business-form">
                {['name','address','email','phone'].map(f => (
                  <TextField key={f} margin="dense" label={f.charAt(0).toUpperCase()+f.slice(1)} name={f} value={form[f]} onChange={e => setForm(p => ({...p, [f]: e.target.value}))} fullWidth required={['name','email'].includes(f)} sx={{ mb: 2 }} />
                ))}
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="business-form" variant="contained" sx={{ fontWeight: 600 }}>Save</Button>
            </DialogActions>
          </Dialog>

          {/* Edit */}
          <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullScreen={isMobile} TransitionComponent={Fade}>
            <DialogTitle sx={{ fontWeight: 700 }}>Edit Business</DialogTitle>
            <DialogContent>
              <form onSubmit={handleEditSubmit} id="edit-business-form">
                {['name','address','email','phone'].map(f => (
                  <TextField key={f} margin="dense" label={f.charAt(0).toUpperCase()+f.slice(1)} name={f} value={editForm[f]} onChange={e => setEditForm(p => ({...p, [f]: e.target.value}))} fullWidth required={['name','email'].includes(f)} sx={{ mb: 2 }} />
                ))}
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="edit-business-form" variant="contained" sx={{ fontWeight: 600 }}>Update</Button>
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
