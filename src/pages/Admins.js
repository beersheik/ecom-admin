import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, Button, CircularProgress, Fade,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api';

const ROLE_COLOR = { superadmin: 'error', admin: 'primary' };

const emptyForm = { name: '', email: '', password: '', role: 'admin', business: '' };

const Admins = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [admins, setAdmins] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin');
      setAdmins(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const { data } = await api.get('/api/businesses');
      setBusinesses(data);
    } catch {}
  };

  useEffect(() => { fetchAdmins(); fetchBusinesses(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (body.role === 'superadmin') delete body.business;
      await api.post('/admin', body);
      enqueueSnackbar('Admin created', { variant: 'success' });
      setOpen(false);
      setForm(emptyForm);
      fetchAdmins();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/${deleteTarget._id}`);
      enqueueSnackbar('Admin deleted', { variant: 'success' });
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Fade in timeout={600}>
        <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Admin Accounts</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ fontWeight: 600 }}>
              Add Admin
            </Button>
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase' } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map(a => (
                  <TableRow key={a._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{a.name || '—'}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        color={ROLE_COLOR[a.role] || 'default'}
                        size="small" sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>{a.business?.name || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(a)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Fade>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Add Admin</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSave} id="admin-form">
            <TextField label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              fullWidth sx={{ mb: 2, mt: 1 }} />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              fullWidth required sx={{ mb: 2 }} />
            <TextField label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              fullWidth required sx={{ mb: 2 }} inputProps={{ minLength: 6 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            {form.role === 'admin' && (
              <FormControl fullWidth required>
                <InputLabel>Business</InputLabel>
                <Select value={form.business} label="Business" onChange={e => setForm(f => ({ ...f, business: e.target.value }))}>
                  {businesses.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" form="admin-form" variant="contained" disabled={saving} sx={{ fontWeight: 600 }}>
            {saving ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Admin</DialogTitle>
        <DialogContent>
          <Typography>Delete <b>{deleteTarget?.email}</b>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ fontWeight: 600 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admins;
