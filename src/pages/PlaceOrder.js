import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
  Divider, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Chip, Alert
} from '@mui/material';
import { Add, Remove, ShoppingCart, Logout } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api, { userApi } from '../api';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PlaceOrder = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [token, setToken] = useState(() => localStorage.getItem('user_token') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [payLoading, setPayLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data } = await api.get('/api/products');
      setProducts(Array.isArray(data) ? data.filter(p => p.status === 'active' && p.stock > 0) : []);
    } catch {
      enqueueSnackbar('Failed to load products', { variant: 'error' });
    } finally {
      setProductsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { data } = await userApi.post('/api/users/login', loginForm);
      localStorage.setItem('user_token', data.token);
      setToken(data.token);
      enqueueSnackbar('Logged in', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    setToken('');
    setCart({});
    setLastOrder(null);
    setProducts([]);
  };

  const updateCart = (product, delta) => {
    setCart(prev => {
      const qty = Math.max(0, Math.min((prev[product._id]?.qty || 0) + delta, product.stock));
      if (qty === 0) {
        const next = { ...prev };
        delete next[product._id];
        return next;
      }
      return { ...prev, [product._id]: { product, qty } };
    });
  };

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);

  const handlePay = async () => {
    if (!cartItems.length) return enqueueSnackbar('Cart is empty', { variant: 'warning' });

    const loaded = await loadRazorpayScript();
    if (!loaded) return enqueueSnackbar('Failed to load Razorpay SDK', { variant: 'error' });

    setPayLoading(true);
    try {
      const { data: order } = await userApi.post('/api/payments/create-order', {
        amount: total,
        items: cartItems.map(({ product, qty }) => ({
          product: product._id,
          quantity: qty,
          price: product.price
        }))
      });

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'Ecom Store',
        description: 'Order Payment',
        handler: async (response) => {
          try {
            const { data: verifyData } = await userApi.post('/api/payments/verify', {
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setLastOrder({ ...verifyData.order, paymentId: response.razorpay_payment_id });
            setCart({});
            enqueueSnackbar('Payment successful!', { variant: 'success' });
          } catch (err) {
            enqueueSnackbar(`Verification failed: ${err.response?.data?.message || err.message}`, { variant: 'error' });
          }
        },
        modal: { ondismiss: () => setPayLoading(false) },
        theme: { color: '#1976d2' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        enqueueSnackbar(`Payment failed: ${response.error.description}`, { variant: 'error' });
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
      setPayLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2, minWidth: 340 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>User Login — Place Order</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Log in as a user to test the payment flow.
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField label="Email" name="email" type="email" value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              fullWidth required sx={{ mb: 2 }} />
            <TextField label="Password" name="password" type="password" value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              fullWidth required sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth disabled={loginLoading} sx={{ fontWeight: 600 }}>
              {loginLoading ? <CircularProgress size={22} /> : 'Login'}
            </Button>
          </form>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Place Order</Typography>
        <Button size="small" startIcon={<Logout />} onClick={handleLogout} color="inherit">Logout User</Button>
      </Box>

      {lastOrder && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setLastOrder(null)}>
          <strong>Payment Successful!</strong> — Payment ID: {lastOrder.paymentId} | Order ID: {lastOrder._id} | Status: {lastOrder.status}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Products */}
        <Paper elevation={2} sx={{ flex: 2, minWidth: 300, borderRadius: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Products</Typography>
          </Box>
          <Divider />
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>No active products found.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p._id} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell align="right">₹{p.price}</TableCell>
                    <TableCell align="right">{p.stock}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => updateCart(p, -1)} disabled={!cart[p._id]}>
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                          {cart[p._id]?.qty || 0}
                        </Typography>
                        <IconButton size="small" onClick={() => updateCart(p, 1)} disabled={(cart[p._id]?.qty || 0) >= p.stock}>
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* Cart */}
        <Paper elevation={2} sx={{ flex: 1, minWidth: 260, borderRadius: 2 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Cart</Typography>
            {cartItems.length > 0 && <Chip size="small" label={cartItems.length} color="primary" />}
          </Box>
          <Divider />
          {cartItems.length === 0 ? (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>No items added.</Typography>
          ) : (
            <>
              <Table size="small">
                <TableBody>
                  {cartItems.map(({ product, qty }) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="center">× {qty}</TableCell>
                      <TableCell align="right">₹{product.price * qty}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handlePay}
                  disabled={payLoading}
                  sx={{ fontWeight: 700 }}
                >
                  {payLoading ? <CircularProgress size={22} /> : `Pay ₹${total}`}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PlaceOrder;
