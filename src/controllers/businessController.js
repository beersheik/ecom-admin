const Joi = require('joi');
const Business = require('../models/Business');

const businessSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().allow(''),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(''),
  createdAt: Joi.date()
});

function scopedId(req) {
  // admin role: force their own business id
  if (req.admin?.role === 'admin') return req.admin.business?._id?.toString() || req.admin.business?.toString();
  return req.params.id;
}

exports.createBusiness = async (req, res) => {
  try {
    const { error } = businessSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const business = new Business(req.body);
    await business.save();
    res.status(201).json(business);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBusinesses = async (req, res) => {
  try {
    // admin only sees their own business
    const filter = req.admin?.role === 'admin' ? { _id: req.admin.business } : {};
    const businesses = await Business.find(filter);
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBusinessById = async (req, res) => {
  try {
    const id = scopedId(req);
    const business = await Business.findById(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const { error } = businessSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const id = scopedId(req);
    const business = await Business.findByIdAndUpdate(id, req.body, { new: true });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRazorpayCredentials = async (req, res) => {
  const { keyId, keySecret } = req.body;
  if (!keyId || !keySecret) return res.status(400).json({ message: 'keyId and keySecret are required' });
  try {
    const id = scopedId(req);
    const business = await Business.findByIdAndUpdate(
      id,
      { 'payments.razorpay.keyId': keyId, 'payments.razorpay.keySecret': keySecret },
      { new: true }
    );
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json({ message: 'Razorpay credentials updated', business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json({ message: 'Business deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
