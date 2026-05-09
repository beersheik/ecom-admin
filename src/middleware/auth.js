const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Attaches req.admin for admin tokens; req.user for user tokens.
// Use requireSuperAdmin / requireAdmin middleware after this.

async function verifyAdminToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
  const token = auth.split(' ')[1];
  if (!token || token === 'null') return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).populate('business', 'name');
    if (!admin) return res.status(403).json({ message: 'Admin account not found' });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!['superadmin', 'admin'].includes(req.admin?.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { verifyAdminToken, requireSuperAdmin, requireAdmin };
