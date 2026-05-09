const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const createAdminSchema = Joi.object({
  name: Joi.string().allow(''),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('superadmin', 'admin').default('admin'),
  business: Joi.string().allow(null, '')
});

exports.adminLogin = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const admin = await Admin.findOne({ email: req.body.email }).populate('business', 'name');
    if (!admin || !(await admin.comparePassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { id: admin._id, role: admin.role };
    if (admin.role === 'admin' && admin.business) {
      payload.business = admin.business._id;
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      role: admin.role,
      name: admin.name,
      email: admin.email,
      business: admin.business || null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminLogout = (req, res) => res.json({ message: 'Logged out' });

// Super admin only — create a new admin or superadmin account
exports.createAdmin = async (req, res) => {
  const { error } = createAdminSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { name, email, password, role, business } = req.body;
  if (role === 'admin' && !business) {
    return res.status(400).json({ message: 'business is required for admin role' });
  }
  try {
    const admin = new Admin({ name, email, password, role, business: business || null });
    await admin.save();
    const result = admin.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
};

// Super admin only — list all admins
exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('business', 'name').select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Super admin only — delete an admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
