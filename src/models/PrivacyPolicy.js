const mongoose = require('mongoose');

const PrivacyPolicySchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);
