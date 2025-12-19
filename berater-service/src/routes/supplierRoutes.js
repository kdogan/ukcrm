const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
  .get(getSuppliers)
  .post(requireAdmin, createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(requireAdmin, updateSupplier)
  .delete(requireAdmin, deleteSupplier);

module.exports = router;
