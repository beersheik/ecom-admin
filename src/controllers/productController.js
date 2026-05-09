

const Joi = require('joi');
const Product = require('../models/Product');
const ProductReview = require('../models/ProductReview');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productSchema = Joi.object({
  business:     Joi.string().required(),
  category:     Joi.string().required(),
  name:         Joi.string().required(),
  sku:          Joi.string().allow('', null),
  brand:        Joi.string().allow('', null),
  description:  Joi.string().allow('', null),
  price:        Joi.number().required(),
  mrp:          Joi.number().allow('', null),
  unit:         Joi.string().allow('', null),
  weight:       Joi.number().allow('', null),
  stock:        Joi.number().default(0),
  minOrderQty:  Joi.number().default(1),
  tags:         Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow('', null),
  hsnCode:      Joi.string().allow('', null),
  gstRate:      Joi.number().default(0),
  warranty:     Joi.string().allow('', null),
  profileImage: Joi.string().allow('', null),
  imageList:    Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).allow('', null),
  status:       Joi.string().valid('active', 'inactive').default('active'),
  createdAt:    Joi.date()
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

exports.upload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'imageList', maxCount: 10 }
]);

exports.createProduct = async (req, res) => {
  try {
    const productData = {
      business: req.body.business,
      category: req.body.category,
      name: req.body.name,
      sku: req.body.sku || '',
      brand: req.body.brand || '',
      description: req.body.description || '',
      price: Number(req.body.price),
      mrp: req.body.mrp ? Number(req.body.mrp) : null,
      unit: req.body.unit || 'piece',
      weight: req.body.weight ? Number(req.body.weight) : null,
      stock: req.body.stock ? Number(req.body.stock) : 0,
      minOrderQty: req.body.minOrderQty ? Number(req.body.minOrderQty) : 1,
      tags: req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : req.body.tags) : [],
      hsnCode: req.body.hsnCode || '',
      gstRate: req.body.gstRate ? Number(req.body.gstRate) : 0,
      warranty: req.body.warranty || '',
      profileImage: req.files?.['profileImage'] ? req.files['profileImage'][0].path : '',
      imageList: req.files?.['imageList'] ? req.files['imageList'].map(file => file.path) : [],
      status: req.body.status || 'active'
    };
    const { error } = productSchema.validate(productData);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.business) filter.business = req.query.business;
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter)
      .populate('category')
      .populate('business')
      .lean();

    // Fetch reviews for each product with optimization
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviews = await ProductReview.find({ product: product._id })
          .populate('user', 'name email')
          .lean();
        return { ...product, reviews };
      })
    );

    res.json(productsWithReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('business');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const reviews = await ProductReview.find({ product: product._id }).populate('user', 'name email');
    res.json({ ...product.toObject(), reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productData = {
      business: req.body.business,
      category: req.body.category,
      name: req.body.name,
      sku: req.body.sku || '',
      brand: req.body.brand || '',
      description: req.body.description || '',
      price: Number(req.body.price),
      mrp: req.body.mrp ? Number(req.body.mrp) : null,
      unit: req.body.unit || 'piece',
      weight: req.body.weight ? Number(req.body.weight) : null,
      stock: req.body.stock ? Number(req.body.stock) : 0,
      minOrderQty: req.body.minOrderQty ? Number(req.body.minOrderQty) : 1,
      tags: req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : req.body.tags) : [],
      hsnCode: req.body.hsnCode || '',
      gstRate: req.body.gstRate ? Number(req.body.gstRate) : 0,
      warranty: req.body.warranty || '',
      profileImage: req.files && req.files['profileImage'] ? req.files['profileImage'][0].path : (req.body.profileImage || ''),
      imageList: req.files && req.files['imageList'] ? req.files['imageList'].map(file => file.path) : (req.body.imageList || []),
      status: req.body.status || 'active'
    };

    const { error } = productSchema.validate(productData);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateProductReviews = async (req, res) => {
  try {
    const { productId, userId, rating, comments } = req.body;
    ProductReview.findOneAndUpdate(
      { product: productId, user: userId },
      { rating, comments },
      { upsert: true, new: true },
      (err, review) => {
        if (err) {
          console.error(`Failed to update reviews for product ${productId}:`, err.message);
          return res.status(500).json({ message: 'Failed to update reviews' });
        }
        return res.json(review);
      }
    );
  } catch (err) {
    console.error(`Failed to update reviews for product ${productId}:`, err.message);
    res.status(500).json({ message: 'Failed to update reviews' });
  }
};


