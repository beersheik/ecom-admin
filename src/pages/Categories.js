import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme, useMediaQuery, Paper, Box, Fade, Typography, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from '../api';
import { isSuperAdmin, getBusiness } from '../auth';

const Categories = () => {
    const superAdmin = isSuperAdmin();
    const myBusiness = getBusiness();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [categories, setCategories] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [form, setForm] = useState({ business: myBusiness, name: '', description: '' });
    const [editForm, setEditForm] = useState({ business: myBusiness, name: '', description: '' });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchCategories();
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const { data } = await api.get('/api/businesses');
            setBusinesses(data);
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
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
            await api.post('/api/categories', form);
            setForm({ name: '', description: '' });
            setOpen(false);
            fetchCategories();
            enqueueSnackbar('Category added successfully!', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
        }
    };

    const handleEditOpen = (cat) => {
        setSelectedCategory(cat);
        setEditForm({ business: cat.business, name: cat.name, description: cat.description });
        setEditOpen(true);
    };
    const handleEditClose = () => setEditOpen(false);
    const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/categories/${selectedCategory._id}`, editForm);
            setEditOpen(false);
            fetchCategories();
            enqueueSnackbar('Category updated successfully!', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
        }
    };

    const handleDeleteOpen = (cat) => {
        setSelectedCategory(cat);
        setDeleteOpen(true);
    };
    const handleDeleteClose = () => setDeleteOpen(false);
    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/api/categories/${selectedCategory._id}`);
            setDeleteOpen(false);
            fetchCategories();
            enqueueSnackbar('Category deleted successfully!', { variant: 'success' });
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
                            Categories
                        </Typography>
                        <Button variant="contained" color="primary" onClick={handleOpen} sx={{ width: isMobile ? '100%' : 'auto', boxShadow: 2, fontWeight: 600 }}>
                            Add Category
                        </Button>
                    </Box>
                    <Divider />
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
                            <CircularProgress />
                        </Box>
                    ) : categories.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
                            <Typography variant="body1">No categories found.</Typography>
                        </Box>
                    ) : (
                         <TableContainer component={Paper} sx={{ boxShadow:  0 , borderRadius: 1, transition: 'box-shadow 0.3s' }}>
                                     <Table size={'small'}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories.map((cat) => (
                                        <TableRow key={cat._id} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                                            <TableCell>{cat.name}</TableCell>
                                            <TableCell>{cat.description}</TableCell>
                                            <TableCell align="right">
                                                <Button size="small" color="primary" onClick={() => handleEditOpen(cat)} startIcon={<Edit />} sx={{ mr: 1 }}>
                                                    Edit
                                                </Button>
                                                <Button size="small" color="error" onClick={() => handleDeleteOpen(cat)} startIcon={<Delete />}>Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {/* Add Dialog */}
                    <Dialog open={open} onClose={handleClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
                        <DialogTitle sx={{ fontWeight: 700 }}>Add Category</DialogTitle>
                        <DialogContent>
                            <form onSubmit={handleSubmit} id="category-form">
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
                                <TextField margin="dense" label="Description" name="description" value={form.description} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                            </form>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={handleClose} sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Cancel</Button>
                            <Button type="submit" form="category-form" variant="contained" sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Save</Button>
                        </DialogActions>
                    </Dialog>
                    {/* Edit Dialog */}
                    <Dialog open={editOpen} onClose={handleEditClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
                        <DialogTitle sx={{ fontWeight: 700 }}>Edit Category</DialogTitle>
                        <DialogContent>
                            <form onSubmit={handleEditSubmit} id="edit-category-form">
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
                                <TextField margin="dense" label="Description" name="description" value={editForm.description} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                            </form>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={handleEditClose} sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Cancel</Button>
                            <Button type="submit" form="edit-category-form" variant="contained" sx={{ width: isMobile ? '100%' : 'auto', fontWeight: 600 }}>Update</Button>
                        </DialogActions>
                    </Dialog>
                    {/* Delete Confirmation Dialog */}
                    <Dialog open={deleteOpen} onClose={handleDeleteClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
                        <DialogTitle sx={{ fontWeight: 700 }}>Delete Category</DialogTitle>
                        <DialogContent>
                            <Typography>Are you sure you want to delete <b>{selectedCategory?.name}</b>?</Typography>
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

export default Categories;
