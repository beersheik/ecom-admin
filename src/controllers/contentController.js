const FAQ = require('../models/FAQ');
const PrivacyPolicy = require('../models/PrivacyPolicy');

// Business ID from token (admin = own, superadmin = query param)
const bizFromQuery = (req) =>
  req.admin?.role === 'admin' ? req.admin.business : (req.query.business || null);

// Business ID from body for writes (admin = own, superadmin = body.business)
const bizFromBody = (req) =>
  req.admin?.role === 'admin' ? req.admin.business : (req.body.business || null);

// --- FAQ ---

exports.getFAQs = async (req, res) => {
  try {
    const business = bizFromQuery(req);
    const filter = business ? { business } : {};
    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFAQ = async (req, res) => {
  const { question, answer, order } = req.body;
  const business = bizFromBody(req);
  if (!question || !answer) return res.status(400).json({ message: 'question and answer are required' });
  if (!business) return res.status(400).json({ message: 'business is required' });
  try {
    const faq = await FAQ.create({ business, question, answer, order: order || 0 });
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFAQ = async (req, res) => {
  const { question, answer, order } = req.body;
  try {
    const filter = { _id: req.params.id };
    if (req.admin?.role === 'admin') filter.business = req.admin.business;
    const faq = await FAQ.findOneAndUpdate(
      filter,
      { question, answer, order },
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.admin?.role === 'admin') filter.business = req.admin.business;
    const faq = await FAQ.findOneAndDelete(filter);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Privacy Policy ---

exports.getPrivacyPolicy = async (req, res) => {
  try {
    const business = bizFromQuery(req);
    const filter = business ? { business } : null;
    const policy = filter ? await PrivacyPolicy.findOne(filter) : null;
    res.json(policy || { content: '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePrivacyPolicy = async (req, res) => {
  const { content } = req.body;
  if (content === undefined) return res.status(400).json({ message: 'content is required' });
  const business = bizFromBody(req);
  if (!business) return res.status(400).json({ message: 'business is required' });
  try {
    const policy = await PrivacyPolicy.findOneAndUpdate(
      { business },
      { content, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
