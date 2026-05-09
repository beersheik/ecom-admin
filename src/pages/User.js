import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme, useMediaQuery, Paper, Box, Fade, Typography, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from '../api';
import { isSuperAdmin, getBusiness } from '../auth';

const User = () => {
  const superAdmin = isSuperAdmin();
  const myBusiness = getBusiness();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', business: myBusiness, password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', business: myBusiness, password: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchBusinesses();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data } = await api.get('/api/businesses');
      setBusinesses(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users', form);
      setForm({ name: '', email: '', role: '', business: '', password: '' });
      setOpen(false);
      fetchUsers();
      enqueueSnackbar('User added successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, business: user.business?._id || '', password: '' });
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${selectedUser._id}`, editForm);
      setEditOpen(false);
      fetchUsers();
      enqueueSnackbar('User updated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => setDeleteOpen(false);
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/users/${selectedUser._id}`);
      setDeleteOpen(false);
      fetchUsers();
      enqueueSnackbar('User deleted successfully!', { variant: 'success' });
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
              Users
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpen} sx={{ width: isMobile ? '100%' : 'auto', boxShadow: 2, fontWeight: 600 }}>
              Add User
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
              <Typography variant="body1">No users found.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 1, transition: 'box-shadow 0.3s' }}>
              <Table size={'small'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align="right">
                        <Button size="small" color="primary" onClick={() => handleEditOpen(user)} startIcon={<Edit />} sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDeleteOpen(user)} startIcon={<Delete />}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Add Dialog */}
          <Dialog open={open} onClose={handleClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
            <DialogTitle sx={{ fontWeight: 700 }}>Add User</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit} id="user-form">
                {superAdmin && (
                  <TextField
                    margin="dense"
                    select
                    label="Business"
                    name="business"
                    value={form.business}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  >
                    {businesses.map((business) => (
                      <MenuItem key={business._id} value={business._id}>
                        {business.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField margin="dense" label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Role" name="role" value={form.role} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose} sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="user-form" variant="contained" sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Save</Button>
            </DialogActions>
          </Dialog>
          {/* Edit Dialog */}
          <Dialog open={editOpen} onClose={handleEditClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
            <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
            <DialogContent>
              <form onSubmit={handleEditSubmit} id="edit-user-form">
                {superAdmin && (
                  <TextField
                    margin="dense"
                    select
                    label="Business"
                    name="business"
                    value={editForm.business}
                    onChange={handleEditChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  >
                    {businesses.map((business) => (
                      <MenuItem key={business._id} value={business._id}>
                        {business.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField margin="dense" label="Name" name="name" value={editForm.name} onChange={handleEditChange} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Email" name="email" value={editForm.email} onChange={handleEditChange} fullWidth required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Password" name="password" type="password" value={editForm.password} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                <TextField margin="dense" label="Role" name="role" value={editForm.role} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleEditClose} sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="edit-user-form" variant="contained" sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Update</Button>
            </DialogActions>
          </Dialog>
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteOpen} onClose={handleDeleteClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
            <DialogTitle sx={{ fontWeight: 700 }}>Delete User</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete <b>{selectedUser?.name}</b>?</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleDeleteClose} sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Delete</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Fade>
    </Box>
  );
};

export default User;
