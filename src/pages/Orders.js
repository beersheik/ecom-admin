import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Fade, Button, TextField, MenuItem, Stack, useTheme, useMediaQuery
} from '@mui/material';
import { useSnackbar } from 'notistack';
import api from '../api';
import ResponsiveTable from '../components/ResponsiveTable';

const STATUS_COLOR = {
  paid: 'success',
  pending: 'warning',
  verifying: 'info',
  failed: 'error',
  refunded: 'default'
};

const FULFILLMENT_STEPS = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' }
];

function fulfillmentLabel(value) {
  if (value === 'cancelled') return 'Cancelled';
  return FULFILLMENT_STEPS.find(s => s.value === value)?.label || 'Placed';
}

function FulfillmentForm({ order, onUpdated }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    fulfillmentStatus: order.fulfillmentStatus || 'placed',
    courier: order.courier || '',
    trackingNumber: order.trackingNumber || ''
  });
  const [saving, setSaving] = useState(false);
  const currentIndex = FULFILLMENT_STEPS.findIndex(s => s.value === (order.fulfillmentStatus || 'placed'));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/api/payments/admin/orders/${order._id}/fulfillment`, form);
      onUpdated(data);
      enqueueSnackbar('Order updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 2 }}>
      <TextField select size="small" label="Delivery status" name="fulfillmentStatus"
        value={form.fulfillmentStatus} onChange={handleChange} sx={{ minWidth: 180, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
        {FULFILLMENT_STEPS.map((step, i) => (
          <MenuItem key={step.value} value={step.value} disabled={i < currentIndex}>{step.label}</MenuItem>
        ))}
      </TextField>
      <TextField size="small" label="Courier" name="courier" value={form.courier} onChange={handleChange} sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }} />
      <TextField size="small" label="Tracking number" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }} />
      <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
    </Box>
  );
}

const STATUS_LABEL = { verifying: 'Check UPI' };

// UPI orders are paid straight to the store, so an admin matches the UTR with the bank before confirming.
const needsUpiCheck = (order) =>
  order.paymentMethod === 'upi' && ['pending', 'verifying'].includes(order.status) && order.fulfillmentStatus !== 'cancelled';

function UpiReview({ order, onUpdated }) {
  const { enqueueSnackbar } = useSnackbar();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const review = async (approve) => {
    if (!approve && !reason.trim()) {
      enqueueSnackbar('Enter a reason so the customer knows why', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put(`/api/payments/admin/orders/${order._id}/upi-review`, { approve, reason });
      onUpdated(data);
      enqueueSnackbar(approve ? 'Payment confirmed, order placed' : 'Payment rejected', { variant: approve ? 'success' : 'info' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 2, p: 1.5, border: 1, borderColor: 'info.light', borderRadius: 1, bgcolor: 'action.hover' }}>
      <Typography variant="subtitle2">
        {order.upiRef
          ? <>Customer says they paid ₹{order.amount}. UTR: <b style={{ fontFamily: 'monospace' }}>{order.upiRef}</b></>
          : <>Waiting for the customer to pay ₹{order.amount} and enter their UTR.</>}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Find this UTR and amount in your bank or UPI app before confirming. Stock is reduced only when you confirm.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Button variant="contained" color="success" disabled={saving} onClick={() => review(true)}>Confirm payment</Button>
        <TextField size="small" label="Reason (for reject)" value={reason} onChange={e => setReason(e.target.value)} inputProps={{ maxLength: 300 }} sx={{ minWidth: 200, flex: { xs: '1 1 100%', sm: '0 1 auto' } }} />
        <Button variant="outlined" color="error" disabled={saving} onClick={() => review(false)}>Reject</Button>
      </Box>
    </Box>
  );
}

function PaymentChips({ order }) {
  return (
    <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'inherit' }}>
      <Chip
        label={STATUS_LABEL[order.status] || order.status}
        color={STATUS_COLOR[order.status] || 'default'}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
      {order.paymentMethod === 'upi' && <Chip label="UPI" size="small" variant="outlined" />}
      {order.refundFailed && (
        <Chip label={order.paymentMethod === 'upi' ? 'Refund manually' : 'Refund failed'} color="error" size="small" variant="outlined" />
      )}
    </Box>
  );
}

// Items, payment references, address and the admin actions for one order.
function OrderDetails({ order, onUpdated }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const address = order.shippingAddress;
  return (
    <Box sx={{ m: { xs: 0, sm: 1 }, mt: 1, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Items</Typography>
      {isMobile ? (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {order.items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{item.product?.name || item.product}</Typography>
                <Typography variant="caption" color="text.secondary">{item.quantity} × ₹{item.price}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{item.total ?? item.price * item.quantity}</Typography>
                {item.offerPrice > 0 && (
                  <Typography variant="caption" color="success.main">{item.offerQty} for ₹{item.offerPrice}</Typography>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Subtotal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.items.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.product?.name || item.product}</TableCell>
              <TableCell align="right">₹{item.price}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">
                ₹{item.total ?? item.price * item.quantity}
                {item.offerPrice > 0 && (
                  <Typography variant="caption" display="block" color="success.main">{item.offerQty} for ₹{item.offerPrice}</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
      {order.upiRef && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          UPI UTR: {order.upiRef}
        </Typography>
      )}
      {order.paymentNote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Payment note: {order.paymentNote}
        </Typography>
      )}
      {order.razorpayPaymentId && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Payment ID: {order.razorpayPaymentId}
        </Typography>
      )}
      {order.razorpayOrderId && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Razorpay Order ID: {order.razorpayOrderId}
        </Typography>
      )}
      {address && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Ship to: {address.name}, {address.phone}, {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.pincode}
        </Typography>
      )}
      {order.cancelReason && (
        <Typography variant="body2" sx={{ mt: 1 }}>Cancel reason: {order.cancelReason}</Typography>
      )}
      {needsUpiCheck(order) && (
        <UpiReview order={order} onUpdated={onUpdated} />
      )}
      {order.status === 'paid' && (
        <FulfillmentForm order={order} onUpdated={onUpdated} />
      )}
    </Box>
  );
}

const Orders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upiOnly, setUpiOnly] = useState(false);
  const upiCount = orders.filter(needsUpiCheck).length;
  const shown = upiOnly && upiCount > 0 ? orders.filter(needsUpiCheck) : orders;

  useEffect(() => {
    api.get('/api/payments/admin/all-orders')
      .then(({ data }) => setOrders(data))
      .catch(err => enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Fade in timeout={600}>
        <Paper elevation={4} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h5">Orders</Typography>
            {!loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {upiCount > 0 && (
                  <Chip
                    label={`${upiCount} need UPI check`}
                    color="info"
                    variant={upiOnly ? 'filled' : 'outlined'}
                    onClick={() => setUpiOnly(v => !v)}
                  />
                )}
                <Typography variant="body2" color="text.secondary">{orders.length} total</Typography>
              </Box>
            )}
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Typography sx={{ p: 3, color: 'text.secondary' }}>No orders found.</Typography>
          ) : (
            <ResponsiveTable
              cardsBelow="lg"
              rows={shown}
              columns={[
                { label: 'Order ID', render: o => o._id, cellSx: { fontFamily: 'monospace', fontSize: 12 } },
                { label: 'Business', render: o => o.business?.name || '—' },
                { label: 'Customer', primary: true, render: o => o.user?.name || o.user?.email || '—' },
                { label: 'Amount', align: 'right', render: o => `₹${o.amount}` },
                { label: 'Payment', render: o => <PaymentChips order={o} /> },
                { label: 'Delivery', render: o => fulfillmentLabel(o.fulfillmentStatus) },
                { label: 'Date', render: o => new Date(o.createdAt).toLocaleString() }
              ]}
              expand={order => (
                <OrderDetails order={order}
                  onUpdated={updated => setOrders(list => list.map(o => (o._id === updated._id ? updated : o)))} />
              )}
            />
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Orders;
