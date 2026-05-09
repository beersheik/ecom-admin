
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const businessRestRoutes = require('./routes/business');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const paymentRoutes = require('./routes/payment');
const contentRoutes = require('./routes/content');
const setupSwagger = require('./swagger');




const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupSwagger(app);


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});
app.use('/uploads', express.static('uploads')); 
app.use('/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRestRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/content', contentRoutes);


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://beersheik:Beer$heik@cluster0.qyqt3.mongodb.net/karthi_ecom?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
