import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Collapse, IconButton, Fade, Button, TextField, MenuItem
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api';

const STATUS_COLOR = {
  paid: 'success',
  pending: 'warning',
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
        value={form.fulfillmentStatus} onChange={handleChange} sx={{ minWidth: 180 }}>
        {FULFILLMENT_STEPS.map((step, i) => (
          <MenuItem key={step.value} value={step.value} disabled={i < currentIndex}>{step.label}</MenuItem>
        ))}
      </TextField>
      <TextField size="small" label="Courier" name="courier" value={form.courier} onChange={handleChange} />
      <TextField size="small" label="Tracking number" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} />
      <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
    </Box>
  );
}

function OrderRow({ order, onUpdated }) {
  const [open, setOpen] = useState(false);
  const address = order.shippingAddress;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(o => !o)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{order._id}</TableCell>
        <TableCell>{order.business?.name || '—'}</TableCell>
        <TableCell>{order.user?.name || order.user?.email || '—'}</TableCell>
        <TableCell align="right">₹{order.amount}</TableCell>
        <TableCell>
          <Chip
            label={order.status}
            color={STATUS_COLOR[order.status] || 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
          {order.refundFailed && (
            <Chip label="Refund failed" color="error" size="small" variant="outlined" sx={{ ml: 0.5 }} />
          )}
        </TableCell>
        <TableCell>{fulfillmentLabel(order.fulfillmentStatus)}</TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Items</Typography>
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
                      <TableCell align="right">₹{item.price * item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              {order.status === 'paid' && (
                <FulfillmentForm order={order} onUpdated={onUpdated} />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const Orders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">Orders</Typography>
            {!loading && (
              <Typography variant="body2" color="text.secondary">{orders.length} total</Typography>
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
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Order ID</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Delivery</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <OrderRow key={order._id} order={order}
                    onUpdated={updated => setOrders(list => list.map(o => (o._id === updated._id ? updated : o)))} />
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Orders;
