const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  payments: {
    razorpay: {
      keyId: { type: String },
      keySecret: { type: String }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);
