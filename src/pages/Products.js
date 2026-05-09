import React, { useEffect, useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme, useMediaQuery, Paper, Box, Fade, Typography, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Avatar, InputAdornment, Card } from '@mui/material';
import { Edit, Delete, Search, InventoryOutlined, TrendingDownOutlined, WarningAmber } from '@mui/icons-material';
import api from '../api';
import { isSuperAdmin, getBusiness } from '../auth';

const BASE = process.env.REACT_APP_API_HOST;

const Products = () => {
  const superAdmin = isSuperAdmin();
  const myBusiness = getBusiness();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [products, setProducts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', brand: '', description: '', price: '', mrp: '', unit: 'piece', weight: '', stock: '', minOrderQty: 1, tags: '', hsnCode: '', gstRate: 0, warranty: '', category: '', business: myBusiness, status: 'active', profileImage: null, imageList: [] });
  const [editForm, setEditForm] = useState({ name: '', sku: '', brand: '', description: '', price: '', mrp: '', unit: 'piece', weight: '', stock: '', minOrderQty: 1, tags: '', hsnCode: '', gstRate: 0, warranty: '', category: '', business: myBusiness, status: 'active' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProducts();
    fetchBusinesses();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/products');
      setProducts(data);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category?._id === categoryFilter;
      const matchesStatus = !statusFilter || product.status === statusFilter;
      const matchesBrand = !brandFilter || product.brand === brandFilter;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesBrand;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, brandFilter]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const handleFileChange = (e, mode) => {
    if (mode === "edit") {
      setEditForm({ ...editForm, [e.target.name]: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.files[0] });
    }
  };

  const handleMultipleFileChange = (e, mode) => {
    if (mode === "edit") {
      setEditForm({ ...editForm, [e.target.name]: Array.from(e.target.files) });
    } else {
      setForm({ ...form, [e.target.name]: Array.from(e.target.files) });
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('sku', form.sku);
    formData.append('brand', form.brand);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('mrp', form.mrp);
    formData.append('unit', form.unit);
    formData.append('weight', form.weight);
    formData.append('stock', form.stock);
    formData.append('minOrderQty', form.minOrderQty);
    formData.append('tags', form.tags);
    formData.append('hsnCode', form.hsnCode);
    formData.append('gstRate', form.gstRate);
    formData.append('warranty', form.warranty);
    formData.append('category', form.category);
    formData.append('business', form.business);
    formData.append('status', form.status);
    if (form.profileImage) formData.append('profileImage', form.profileImage);
    if (form.imageList && form.imageList.length > 0) {
      form.imageList.forEach((file) => formData.append('imageList', file));
    }

    try {
      await api.post('/api/products', formData);
      setForm({ name: '', sku: '', brand: '', description: '', price: '', mrp: '', unit: 'piece', weight: '', stock: '', minOrderQty: 1, tags: '', hsnCode: '', gstRate: 0, warranty: '', category: '', business: myBusiness, status: 'active', profileImage: null, imageList: [] });
      setOpen(false);
      fetchProducts();
      enqueueSnackbar('Product added successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleEditOpen = (product) => {
    setSelectedProduct(product);
    setEditForm({ 
      name: product.name, 
      sku: product.sku || '', 
      brand: product.brand || '', 
      description: product.description, 
      price: product.price, 
      mrp: product.mrp || '', 
      unit: product.unit || 'piece', 
      weight: product.weight || '', 
      stock: product.stock, 
      minOrderQty: product.minOrderQty || 1, 
      tags: product.tags?.join(', ') || '', 
      hsnCode: product.hsnCode || '', 
      gstRate: product.gstRate || 0, 
      warranty: product.warranty || '', 
      category: product.category?._id || '', 
      business: product.business?._id || '', 
      status: product.status, 
      profileImage: product.profileImage || null, 
      imageList: product.imageList || [] 
    });
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditChange = (e) => {
    const { name, type, value, files } = e.target;
    if (type === 'file') {
      setEditForm({ ...editForm, [name]: files[0] || '' });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('sku', editForm.sku);
    formData.append('brand', editForm.brand);
    formData.append('description', editForm.description);
    formData.append('price', editForm.price);
    formData.append('mrp', editForm.mrp);
    formData.append('unit', editForm.unit);
    formData.append('weight', editForm.weight);
    formData.append('stock', editForm.stock);
    formData.append('minOrderQty', editForm.minOrderQty);
    formData.append('tags', editForm.tags);
    formData.append('hsnCode', editForm.hsnCode);
    formData.append('gstRate', editForm.gstRate);
    formData.append('warranty', editForm.warranty);
    formData.append('category', editForm.category);
    formData.append('business', editForm.business);
    formData.append('status', editForm.status);
    if (editForm.profileImage && editForm.profileImage instanceof File) {
      formData.append('profileImage', editForm.profileImage);
    }
    if (editForm.imageList && editForm.imageList.length > 0) {
      editForm.imageList.forEach((file) => {
        if (file instanceof File) {
          formData.append('imageList', file);
        }
      });
    }
    try {
      await api.put(`/api/products/${selectedProduct._id}`, formData);
      setEditOpen(false);
      fetchProducts();
      enqueueSnackbar('Product updated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  const handleDeleteOpen = (product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => setDeleteOpen(false);
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/products/${selectedProduct._id}`);
      setDeleteOpen(false);
      fetchProducts();
      enqueueSnackbar('Product deleted successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: 'error' });
    }
  };

  // Helper functions
  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error', icon: <WarningAmber /> };
    if (stock < 10) return { label: 'Low Stock', color: 'warning', icon: <InventoryOutlined /> };
    return { label: 'In Stock', color: 'success', icon: <InventoryOutlined /> };
  };

  const getDiscountPercentage = (price, mrp) => {
    if (!mrp || mrp <= 0) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const getAllBrands = () => {
    const brands = new Set(products.filter(p => p.brand).map(p => p.brand));
    return Array.from(brands);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE}/${imagePath}`;
  };

  return (
    <Box sx={{ mt: isMobile ? 2 : 4 }}>
      <Fade in timeout={600}>
        <Paper elevation={isMobile ? 0 : 4} sx={{ borderRadius: 2, bgcolor: 'background.paper', boxShadow: isMobile ? 0 : 1 }}>
          <Box sx={{ display: 'flex', alignProducts: 'center', p: isMobile ? 1 : 2, justifyContent: 'space-between' }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ flexGrow: 1 }} gutterBottom>
              Products
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpen} sx={{ width: isMobile ? '100%' : 'auto', boxShadow: 2, fontWeight: 600 }}>
              Add Product
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {/* Search and Filter Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>Search & Filter</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <TextField
                placeholder="Search by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
              <TextField
                select
                label="Filter by Brand"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="">All Brands</MenuItem>
                {getAllBrands().map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              Found {filteredProducts.length} product(s)
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
              <Typography variant="body1">No products found.</Typography>
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
              <Typography variant="body1">No products match your filters.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 1, transition: 'box-shadow 0.3s', overflowX: 'auto' }}>
              <Table size={'small'}>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Image</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>SKU</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Brand</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Price</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Discount</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Stock</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const discount = getDiscountPercentage(product.price, product.mrp);
                    return (
                      <TableRow key={product._id} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          {product.profileImage && !imageErrors[product._id] ? (
                            <Avatar 
                              variant="square" 
                              src={getImageUrl(product.profileImage)} 
                              onError={() => handleImageError(product._id)}
                              sx={{ width: 40, height: 40, borderRadius: 0.5 }} 
                            />
                          ) : (
                            <Avatar variant="square" sx={{ width: 40, height: 40, borderRadius: 0.5, bgcolor: 'grey.300' }}>
                              <InventoryOutlined fontSize="small" />
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                        <TableCell><Chip label={product.sku || '-'} size="small" variant="outlined" /></TableCell>
                        <TableCell>{product.brand || '-'}</TableCell>
                        <TableCell>{product.category?.name || '-'}</TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>₹{product.price}</Typography>
                            {product.mrp && product.mrp > product.price && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>₹{product.mrp}</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {discount > 0 ? (
                            <Chip label={`${discount}% off`} size="small" variant="filled" color="error" icon={<TrendingDownOutlined />} />
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${product.stock} units`} 
                            size="small" 
                            variant="outlined"
                            color={stockStatus.color}
                            icon={stockStatus.icon}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={product.status} 
                            size="small" 
                            color={product.status === 'active' ? 'success' : 'default'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" color="primary" onClick={() => handleEditOpen(product)} startIcon={<Edit />} sx={{ mr: 1 }}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteOpen(product)} startIcon={<Delete />}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {/* Add Dialog */}
          <Dialog open={open} onClose={handleClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400} maxWidth="sm" fullWidth={!isMobile}>
            <DialogTitle sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Add Product</DialogTitle>
            <DialogContent sx={{ pt: 3, maxHeight: 'calc(100vh - 120px)', overflow: 'auto', bgcolor: 'background.default' }}>
              <form onSubmit={handleSubmit} id="product-form">
                {/* Media Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryOutlined /> Product Images
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                    <TextField
                      margin="dense"
                      label="Profile Image"
                      type="file"
                      name="profileImage"
                      onChange={(e) => handleFileChange(e, "add")}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ input: { accept: 'image/*' } }}
                    />
                    <TextField
                      margin="dense"
                      label="Image List"
                      type="file"
                      name="imageList"
                      onChange={(e) => handleMultipleFileChange(e, "add")}
                      inputProps={{ multiple: true, accept: 'image/*' }}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Card>

                {/* Business & Category Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Basic Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
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
                      >
                        {businesses.map((business) => (
                          <MenuItem key={business._id} value={business._id}>
                            {business.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    <TextField
                      margin="dense"
                      select
                      label="Category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      fullWidth
                      required
                    >
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Product Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
                    <TextField margin="dense" label="SKU" name="sku" value={form.sku} onChange={handleChange} fullWidth />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Brand" name="brand" value={form.brand} onChange={handleChange} fullWidth />
                    <TextField margin="dense" label="Warranty" name="warranty" value={form.warranty} onChange={handleChange} fullWidth placeholder="e.g., 1 Year, 2 Years" />
                  </Box>
                </Card>

                {/* Pricing Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1, bgcolor: 'success.lighter' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>💰 Pricing</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                    <TextField margin="dense" label="Price (₹)" name="price" value={form.price} onChange={handleChange} fullWidth required type="number" inputProps={{ step: '0.01', min: '0' }} />
                    <TextField margin="dense" label="MRP (₹)" name="mrp" value={form.mrp} onChange={handleChange} fullWidth type="number" inputProps={{ step: '0.01', min: '0' }} />
                  </Box>
                </Card>

                {/* Inventory Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1, bgcolor: 'info.lighter' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'info.main' }}>📦 Inventory</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 2 }}>
                    <TextField margin="dense" label="Stock Qty" name="stock" value={form.stock} onChange={handleChange} fullWidth type="number" inputProps={{ min: '0' }} />
                    <TextField margin="dense" label="Min Order Qty" name="minOrderQty" value={form.minOrderQty} onChange={handleChange} fullWidth type="number" inputProps={{ min: '1' }} />
                    <TextField margin="dense" label="Unit" name="unit" value={form.unit} onChange={handleChange} fullWidth select>
                      <MenuItem value="piece">Piece</MenuItem>
                      <MenuItem value="kg">Kg</MenuItem>
                      <MenuItem value="g">Grams</MenuItem>
                      <MenuItem value="liter">Liter</MenuItem>
                      <MenuItem value="ml">ML</MenuItem>
                      <MenuItem value="dozen">Dozen</MenuItem>
                    </TextField>
                    <TextField margin="dense" label="Weight" name="weight" value={form.weight} onChange={handleChange} fullWidth type="number" inputProps={{ step: '0.01', min: '0' }} placeholder="in kg" />
                  </Box>
                </Card>

                {/* Tax & Compliance Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1, bgcolor: 'warning.lighter' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>⚖️ Tax & Compliance</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                    <TextField margin="dense" label="HSN Code" name="hsnCode" value={form.hsnCode} onChange={handleChange} fullWidth />
                    <TextField margin="dense" label="GST Rate (%)" name="gstRate" value={form.gstRate} onChange={handleChange} fullWidth type="number" inputProps={{ step: '0.01', min: '0', max: '100' }} />
                  </Box>
                </Card>

                {/* Tags & Description */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Additional Details</Typography>
                  <TextField margin="dense" label="Tags" name="tags" value={form.tags} onChange={handleChange} fullWidth multiline rows={2} placeholder="Comma separated tags (e.g., electronics, premium, bestseller)" sx={{ mb: 2 }} />
                  <TextField margin="dense" label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
                </Card>

                {/* Status Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <TextField margin="dense" label="Status" name="status" value={form.status} onChange={handleChange} fullWidth select required>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Card>
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1, bgcolor: 'background.default' }}>
              <Button onClick={handleClose} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="product-form" variant="contained" sx={{ fontWeight: 600 }}>Save Product</Button>
            </DialogActions>
          </Dialog>
          {/* Edit Dialog */}
          <Dialog open={editOpen} onClose={handleEditClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400} maxWidth="sm" fullWidth={!isMobile}>
            <DialogTitle sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}>Edit Product</DialogTitle>
            <DialogContent sx={{ pt: 3, maxHeight: 'calc(100vh - 120px)', overflow: 'auto', bgcolor: 'background.default' }}>
              <form onSubmit={handleEditSubmit} id="edit-product-form">
                {/* Media Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryOutlined /> Product Images
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                    <TextField
                      margin="dense"
                      label="Profile Image"
                      type="file"
                      name="profileImage"
                      onChange={(e) => handleFileChange(e, "edit")}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ input: { accept: 'image/*' } }}
                    />
                    <TextField
                      margin="dense"
                      label="Image List"
                      type="file"
                      name="imageList"
                      onChange={(e) => handleMultipleFileChange(e, "edit")}
                      inputProps={{ multiple: true, accept: 'image/*' }}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Card>

                {/* Business & Category Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Basic Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
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
                      >
                        {businesses.map((business) => (
                          <MenuItem key={business._id} value={business._id}>
                            {business.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    <TextField
                      margin="dense"
                      select
                      label="Category"
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      fullWidth
                      required
                    >
                      {categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Product Name" name="name" value={editForm.name} onChange={handleEditChange} fullWidth required />
                    <TextField margin="dense" label="SKU" name="sku" value={editForm.sku} onChange={handleEditChange} fullWidth />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Brand" name="brand" value={editForm.brand} onChange={handleEditChange} fullWidth />
                    <TextField margin="dense" label="Warranty" name="warranty" value={editForm.warranty} onChange={handleEditChange} fullWidth placeholder="e.g., 1 Year, 2 Years" />
                  </Box>
                </Card>

                {/* Pricing Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1, bgcolor: 'success.lighter' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>💰 Pricing</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                    <TextField margin="dense" label="Price (₹)" name="price" value={editForm.price} onChange={handleEditChange} fullWidth required type="number" inputProps={{ step: '0.01', min: '0' }} />
                    <TextField margin="dense" label="MRP (₹)" name="mrp" value={editForm.mrp} onChange={handleEditChange} fullWidth type="number" inputProps={{ step: '0.01', min: '0' }} />
                  </Box>
                </Card>

                {/* Inventory Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1, bgcolor: 'info.lighter' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'info.main' }}>📦 Inventory</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 2 }}>
                    <TextField margin="dense" label="Stock Qty" name="stock" value={editForm.stock} onChange={handleEditChange} fullWidth type="number" inputProps={{ min: '0' }} />
                    <TextField margin="dense" label="Min Order Qty" name="minOrderQty" value={editForm.minOrderQty} onChange={handleEditChange} fullWidth type="number" inputProps={{ min: '1' }} />
                    <TextField margin="dense" label="Unit" name="unit" value={editForm.unit} onChange={handleEditChange} fullWidth select>
                      <MenuItem value="piece">Piece</MenuItem>
                      <MenuItem value="kg">Kg</MenuItem>
                      <MenuItem value="g">Grams</MenuItem>
                      <MenuItem value="liter">Liter</MenuItem>
                      <MenuItem value="ml">ML</MenuItem>
                      <MenuItem value="dozen">Dozen</MenuItem>
                    </TextField>
                    <TextField margin="dense" label="Weight" name="weight" value={editForm.weight} onChange={handleEditChange} fullWidth type="number" inputProps={{ step: '0.01', min: '0' }} placeholder="in kg" />
                  </Box>
                </Card>

                {/* Tax & Compliance Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1, bgcolor: 'warning.lighter' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>⚖️ Tax & Compliance</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                    <TextField margin="dense" label="HSN Code" name="hsnCode" value={editForm.hsnCode} onChange={handleEditChange} fullWidth />
                    <TextField margin="dense" label="GST Rate (%)" name="gstRate" value={editForm.gstRate} onChange={handleEditChange} fullWidth type="number" inputProps={{ step: '0.01', min: '0', max: '100' }} />
                  </Box>
                </Card>

                {/* Tags & Description */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Additional Details</Typography>
                  <TextField margin="dense" label="Tags" name="tags" value={editForm.tags} onChange={handleEditChange} fullWidth multiline rows={2} placeholder="Comma separated tags (e.g., electronics, premium, bestseller)" sx={{ mb: 2 }} />
                  <TextField margin="dense" label="Description" name="description" value={editForm.description} onChange={handleEditChange} fullWidth multiline rows={3} />
                </Card>

                {/* Status Section */}
                <Card sx={{ p: 2, mb: 2, boxShadow: 1 }}>
                  <TextField margin="dense" label="Status" name="status" value={editForm.status} onChange={handleEditChange} fullWidth select required>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Card>
              </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1, bgcolor: 'background.default' }}>
              <Button onClick={handleEditClose} sx={{ fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" form="edit-product-form" variant="contained" sx={{ fontWeight: 600 }}>Update Product</Button>
            </DialogActions>
          </Dialog>
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteOpen} onClose={handleDeleteClose} fullScreen={isMobile} TransitionComponent={Fade} transitionDuration={400}>
            <DialogTitle sx={{ fontWeight: 700 }}>Delete Product</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete <b>{selectedProduct?.name}</b>?</Typography>
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

export default Products;
