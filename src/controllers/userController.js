const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('business');
    debugger; 
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, business: user.business._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, business: user.business });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.userLogout = (req, res) => {
  res.json({ message: 'Logged out' });
};

const Joi = require('joi');
const userSchema = Joi.object({
  business: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().allow(''),
  role: Joi.string().valid('user', 'manager', 'admin').default('user'),
  createdAt: Joi.date()
});

const userUpdateSchema = Joi.object({
  business: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  name: Joi.string().allow(''),
  role: Joi.string().valid('user', 'manager', 'admin'),
  createdAt: Joi.date()
});

exports.createUser = async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    let user = new User(req.body);
    if (req.body.role === 'admin') {
      user = new Admin(req.body);
    }
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const filter = req.admin?.role === 'admin' ? { business: req.admin.business } : {};
    const users = await User.find(filter).populate('business');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('business');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { error } = userUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    let user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (req.body.role === 'admin') {
      user = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
