import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, Button, CircularProgress, Fade, TextField, MenuItem,
  FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Campaign } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api';
import { isSuperAdmin, getBusiness } from '../auth';
import ResponsiveTable from '../components/ResponsiveTable';
import { cardSx } from '../theme';

const EMPTY = { title: '', body: '', url: '/shop', email: false };

// Send a message (new collection, sale, holiday hours...) to every shopper of a business:
// bell + phone push, and optionally email.
const Announcements = () => {
  const superAdmin = isSuperAdmin();
  const { enqueueSnackbar } = useSnackbar();
  const [businesses, setBusinesses] = useState([]);
  const [business, setBusiness] = useState(superAdmin ? '' : getBusiness());
  const [form, setForm] = useState(EMPTY);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const loadHistory = useCallback(() => {
    setLoading(true);
    api.get('/api/notifications/admin/announcements')
      .then(({ data }) => setHistory(data))
      .catch(err => enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadHistory();
    if (superAdmin) {
      api.get('/api/businesses').then(({ data }) => {
        setBusinesses(data);
        if (data.length === 1) setBusiness(data[0]._id);
      }).catch(() => {});
    }
  }, [loadHistory, superAdmin]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: key === 'email' ? e.target.checked : e.target.value }));

  const send = async () => {
    setSending(true);
    try {
      const { data } = await api.post('/api/notifications/admin/announcements', { ...form, business });
      enqueueSnackbar(data.message, { variant: 'success' });
      setForm(EMPTY);
      setConfirm(false);
      loadHistory();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  const businessName = businesses.find(b => b._id === business)?.name || localStorage.getItem('businessName') || 'this business';
  const canSend = form.title.trim() && form.body.trim() && business;

  return (
    <Box>
      <Fade in timeout={600}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Paper elevation={0} sx={cardSx}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Send an announcement</Typography>
              <Typography variant="body2" color="text.secondary">Shoppers see it in the store's bell and as a phone notification if they turned notifications on.</Typography>
            </Box>
            <Divider />
            <Box
              component="form"
              onSubmit={(e) => { e.preventDefault(); if (canSend) setConfirm(true); }}
              sx={{ p: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
            >
              {superAdmin && (
                <TextField select label="Business" value={business} onChange={e => setBusiness(e.target.value)} required sx={{ gridColumn: { md: '1 / -1' } }}>
                  {businesses.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                </TextField>
              )}
              <TextField label="Title" value={form.title} onChange={set('title')} required inputProps={{ maxLength: 80 }}
                helperText={`${form.title.length}/80 · e.g. "New Diwali collection is here"`} />
              <TextField label="Link (store page)" value={form.url} onChange={set('url')} inputProps={{ maxLength: 300 }}
                helperText="Where tapping it opens, e.g. /shop or /products/<id>" />
              <TextField label="Message" value={form.body} onChange={set('body')} required multiline minRows={3} inputProps={{ maxLength: 300 }}
                helperText={`${form.body.length}/300`} sx={{ gridColumn: { md: '1 / -1' } }} />
              <FormControlLabel control={<Checkbox checked={form.email} onChange={set('email')} />} label="Also send by email" sx={{ gridColumn: { md: '1 / -1' } }} />
              <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                <Button type="submit" variant="contained" startIcon={<Campaign />} disabled={!canSend}>Send announcement</Button>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={cardSx}>
            <Box sx={{ p: 2 }}><Typography variant="h6">Sent</Typography></Box>
            <Divider />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
            ) : history.length === 0 ? (
              <Typography sx={{ p: 3, color: 'text.secondary' }}>No announcements sent yet.</Typography>
            ) : (
              <ResponsiveTable
                rows={history}
                rowKey={(r, i) => `${r.at}-${i}`}
                columns={[
                  { label: 'Announcement', primary: true, render: r => (
                    <Box><Box sx={{ fontWeight: 600 }}>{r.title}</Box><Typography variant="body2" color="text.secondary">{r.body}</Typography></Box>
                  ) },
                  ...(superAdmin ? [{ label: 'Business', render: r => r.business?.name || '—' }] : []),
                  { label: 'Sent to', align: 'right', render: r => r.sentTo },
                  { label: 'Read', align: 'right', render: r => `${r.read} (${r.sentTo ? Math.round((r.read / r.sentTo) * 100) : 0}%)` },
                  { label: 'Sent', render: r => new Date(r.at).toLocaleString() }
                ]}
              />
            )}
          </Paper>
        </Box>
      </Fade>

      <Dialog open={confirm} onClose={() => !sending && setConfirm(false)} fullWidth maxWidth="xs">
        <DialogTitle>Send to all shoppers?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "<b>{form.title}</b>" will go to every shopper of {businessName}{form.email ? ', including by email' : ''}. This can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)} disabled={sending}>Cancel</Button>
          <Button onClick={send} variant="contained" disabled={sending} startIcon={sending ? <CircularProgress size={18} color="inherit" /> : null}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;
