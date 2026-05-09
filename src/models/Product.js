const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  business:     { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name:         { type: String, required: true },
  sku:          { type: String },
  brand:        { type: String },
  description:  { type: String },
  price:        { type: Number, required: true },
  mrp:          { type: Number },
  unit:         { type: String, default: 'piece' },
  weight:       { type: Number },
  stock:        { type: Number, default: 0 },
  minOrderQty:  { type: Number, default: 1 },
  tags:         [{ type: String }],
  hsnCode:      { type: String },
  gstRate:      { type: Number, default: 0 },
  warranty:     { type: String },
  status:       { type: String, enum: ['active', 'inactive'], default: 'active' },
  profileImage: { type: String },
  imageList:    [{ type: String }],
  createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
