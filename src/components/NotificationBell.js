import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Box, Button, Divider, IconButton, List, ListItem, ListItemButton, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { NotificationsNone, NotificationsActiveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api';

const POLL_MS = 60 * 1000;
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function base64ToBytes(base64) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

// The admin panel only needs a service worker for push, so it's registered when push is turned on.
const adminWorker = () => navigator.serviceWorker.register('/admin-sw.js');

function timeAgo(date) {
  const minutes = Math.round((Date.now() - new Date(date)) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// New orders, UPI payments to check and cancellations for this admin's business(es).
export default function NotificationBell() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [anchor, setAnchor] = useState(null);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [push, setPush] = useState(() => (!pushSupported() ? 'unsupported' : Notification.permission === 'denied' ? 'blocked' : 'off'));
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/api/notifications/admin');
      setItems(data.items);
      setUnread(data.unread);
    } catch { /* keep the last state */ }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, POLL_MS);
    const onMessage = (e) => { if (e.data?.type === 'notifications:refresh') refresh(); };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    // Already subscribed on this device? Re-link it to whoever is signed in now.
    if (pushSupported() && Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration('/').then(async (reg) => {
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await api.post('/api/notifications/admin/push-subscribe', { subscription: sub.toJSON() }).catch(() => {});
          setPush('on');
        }
      });
    }
    return () => { clearInterval(timer); navigator.serviceWorker?.removeEventListener('message', onMessage); };
  }, [refresh]);

  const turnOn = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPush(permission === 'denied' ? 'blocked' : 'off');
        return;
      }
      await adminWorker();
      const reg = await navigator.serviceWorker.ready;
      const { data } = await api.get('/api/notifications/push-key');
      const sub = (await reg.pushManager.getSubscription())
        || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(data.publicKey) });
      await api.post('/api/notifications/admin/push-subscribe', { subscription: sub.toJSON() });
      setPush('on');
      enqueueSnackbar('Notifications on for this device', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Could not turn on notifications', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    const reg = await navigator.serviceWorker.getRegistration('/');
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await api.post('/api/notifications/admin/push-unsubscribe', { endpoint: sub.endpoint }).catch(() => {});
      await sub.unsubscribe();
    }
    setPush('off');
  };

  const open = (n) => {
    setAnchor(null);
    if (!n.readAt) {
      setItems(list => list.map(x => (x._id === n._id ? { ...x, readAt: new Date().toISOString() } : x)));
      setUnread(c => Math.max(0, c - 1));
      api.post(`/api/notifications/admin/${n._id}/read`).catch(() => {});
    }
    if (n.url) navigate(n.url);
  };

  const markAll = () => {
    setItems(list => list.map(x => (x.readAt ? x : { ...x, readAt: new Date().toISOString() })));
    setUnread(0);
    api.post('/api/notifications/admin/read-all').catch(() => {});
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={e => { setAnchor(e.currentTarget); refresh(); }} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
          <Badge badgeContent={unread} color="error" max={99}><NotificationsNone /></Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 'min(380px, calc(100vw - 16px))', maxHeight: 'min(560px, calc(100vh - 96px))', display: 'flex', flexDirection: 'column' } } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25 }}>
          <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
          {unread > 0 && <Button size="small" onClick={markAll}>Mark all read</Button>}
        </Stack>
        <Divider />
        {push === 'off' && (
          <Box sx={{ m: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <NotificationsActiveOutlined color="primary" />
            <Typography variant="body2" sx={{ flex: 1 }}>Get new orders and UPI payments to check on this device.</Typography>
            <Button size="small" variant="contained" disabled={busy} onClick={turnOn} sx={{ flexShrink: 0 }}>{busy ? 'Turning on…' : 'Turn on'}</Button>
          </Box>
        )}
        {push === 'blocked' && <Alert severity="info" sx={{ m: 1.5 }}>Notifications are blocked for this site. Allow them in your browser settings to get alerts.</Alert>}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>No notifications yet. New orders will appear here.</Typography>
          ) : (
            <List disablePadding>
              {items.map(n => (
                <ListItem key={n._id} disablePadding>
                <ListItemButton onClick={() => open(n)} sx={{ alignItems: 'flex-start', gap: 1.25, py: 1.25, bgcolor: n.readAt ? 'transparent' : 'action.hover' }}>
                  <Box aria-hidden sx={{ width: 8, height: 8, mt: 0.9, borderRadius: '50%', flexShrink: 0, bgcolor: n.readAt ? 'transparent' : 'primary.main' }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: n.readAt ? 500 : 700 }}>{n.title}</Typography>
                    {n.body && <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{n.body}</Typography>}
                    <Typography variant="caption" color="text.secondary">
                      {timeAgo(n.createdAt)}{n.business?.name ? ` · ${n.business.name}` : ''}
                    </Typography>
                  </Box>
                </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        {push === 'on' && (
          <>
            <Divider />
            <Button size="small" color="inherit" onClick={turnOff} sx={{ m: 0.5, alignSelf: 'center', color: 'text.secondary' }}>Turn off notifications on this device</Button>
          </>
        )}
      </Popover>
    </>
  );
}
