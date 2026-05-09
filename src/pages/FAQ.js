import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, Button, CircularProgress, Fade,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, MenuItem
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api';
import { isSuperAdmin, getBusiness } from '../auth';

const emptyForm = { question: '', answer: '', order: '' };

const FAQ = () => {
  const { enqueueSnackbar } = useSnackbar();
  const superAdmin = isSuperAdmin();
  const myBusiness = getBusiness();

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(superAdmin ? '' : myBusiness);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (superAdmin) {
      api.get('/api/businesses').then(({ data }) => {
        setBusinesses(data);
        if (data.length > 0) setSelectedBusiness(data[0]._id);
      }).catch(() => {});
    }
  }, [superAdmin]);

  useEffect(() => {
    if (selectedBusiness) fetchFAQs();
    else setFaqs([]);
  }, [selectedBusiness]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/content/faq?business=${selectedBusiness}`);
      setFaqs(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (faq) => { setEditTarget(faq); setForm({ question: faq.question, answer: faq.answer, order: faq.order }); setOpen(true); };
  const handleClose = () => { setOpen(false); setEditTarget(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, order: Number(form.order) || 0 };
    if (superAdmin) payload.business = selectedBusiness;
    try {
      if (editTarget) {
        await api.put(`/api/content/faq/${editTarget._id}`, payload);
      } else {
        await api.post('/api/content/faq', payload);
      }
      enqueueSnackbar(editTarget ? 'FAQ updated' : 'FAQ added', { variant: 'success' });
      handleClose();
      fetchFAQs();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/content/faq/${deleteTarget._id}`);
      enqueueSnackbar('FAQ deleted', { variant: 'success' });
      setDeleteTarget(null);
      fetchFAQs();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const selectedBusinessName = businesses.find(b => b._id === selectedBusiness)?.name || '';

  return (
    <Box sx={{ mt: 2 }}>
      <Fade in timeout={600}>
        <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h5">FAQ</Typography>
              {selectedBusinessName && (
                <Typography variant="caption" color="text.secondary">{selectedBusinessName}</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {superAdmin && businesses.length > 0 && (
                <TextField
                  select size="small" label="Business"
                  value={selectedBusiness}
                  onChange={e => setSelectedBusiness(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  {businesses.map(b => (
                    <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                  ))}
                </TextField>
              )}
              <Button variant="contained" startIcon={<Add />} onClick={openAdd}
                disabled={!selectedBusiness} sx={{ fontWeight: 600 }}>
                Add FAQ
              </Button>
            </Box>
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : !selectedBusiness ? (
            <Typography sx={{ p: 3, color: 'text.secondary' }}>Select a business to view FAQs.</Typography>
          ) : faqs.length === 0 ? (
            <Typography sx={{ p: 3, color: 'text.secondary' }}>No FAQs yet. Click "Add FAQ" to get started.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Question</TableCell>
                  <TableCell>Answer</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faqs.map((faq, i) => (
                  <TableRow key={faq._id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell sx={{ maxWidth: 280, fontWeight: 500 }}>{faq.question}</TableCell>
                    <TableCell sx={{ maxWidth: 360, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>{faq.answer}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openEdit(faq)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(faq)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Fade>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" TransitionComponent={Fade}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editTarget ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSave} id="faq-form">
            <TextField label="Question" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              fullWidth required multiline rows={2} sx={{ mb: 2, mt: 1 }} />
            <TextField label="Answer" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              fullWidth required multiline rows={4} sx={{ mb: 2 }} />
            <TextField label="Display Order" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
              type="number" sx={{ width: 160 }} helperText="Lower = shown first" />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button type="submit" form="faq-form" variant="contained" disabled={saving} sx={{ fontWeight: 600 }}>
            {saving ? <CircularProgress size={20} /> : editTarget ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} TransitionComponent={Fade}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete FAQ</DialogTitle>
        <DialogContent>
          <Typography>Delete: <b>{deleteTarget?.question}</b>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ fontWeight: 600 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQ;
