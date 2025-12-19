const express = require('express');
const router = express.Router();
const Supplier = require('../models/supplier.model');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /api/suppliers
router.get('/', async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
});

// POST /api/suppliers (Admin only)
router.post('/', adminMiddleware, async (req, res, next) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
