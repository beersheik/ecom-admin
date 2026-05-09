import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, Button, CircularProgress, Fade, TextField, MenuItem
} from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../api';
import { isSuperAdmin, getBusiness } from '../auth';

const PrivacyPolicy = () => {
  const { enqueueSnackbar } = useSnackbar();
  const superAdmin = isSuperAdmin();
  const myBusiness = getBusiness();

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(superAdmin ? '' : myBusiness);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    if (superAdmin) {
      api.get('/api/businesses').then(({ data }) => {
        setBusinesses(data);
        if (data.length > 0) setSelectedBusiness(data[0]._id);
      }).catch(() => {});
    }
  }, [superAdmin]);

  useEffect(() => {
    if (selectedBusiness) fetchPolicy();
    else { setContent(''); setUpdatedAt(null); }
  }, [selectedBusiness]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/content/privacy-policy?business=${selectedBusiness}`);
      setContent(data.content || '');
      setUpdatedAt(data.updatedAt || null);
    } catch {
      enqueueSnackbar('Failed to load privacy policy', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { content };
      if (superAdmin) payload.business = selectedBusiness;
      const { data } = await api.put('/api/content/privacy-policy', payload);
      setUpdatedAt(data.updatedAt);
      enqueueSnackbar('Privacy policy saved', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const selectedBusinessName = businesses.find(b => b._id === selectedBusiness)?.name || '';

  return (
    <Box sx={{ mt: 2 }}>
      <Fade in timeout={600}>
        <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h5">Privacy Policy</Typography>
              {selectedBusinessName && (
                <Typography variant="caption" color="text.secondary">{selectedBusinessName}</Typography>
              )}
              {updatedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </Typography>
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
              <Button variant="contained" onClick={handleSave}
                disabled={saving || loading || !selectedBusiness} sx={{ fontWeight: 600 }}>
                {saving ? <CircularProgress size={22} /> : 'Save'}
              </Button>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            {!selectedBusiness ? (
              <Typography color="text.secondary">Select a business to edit its privacy policy.</Typography>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
              <TextField
                value={content}
                onChange={e => setContent(e.target.value)}
                multiline
                minRows={20}
                fullWidth
                placeholder="Enter your privacy policy content here..."
                variant="outlined"
              />
            )}
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default PrivacyPolicy;
