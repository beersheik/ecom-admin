import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Divider, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Collapse, IconButton, Fade, Button
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

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);

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
        </TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0 }}>
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
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <OrderRow key={order._id} order={order} />
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
