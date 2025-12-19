const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deactivateCustomer,
  reactivateCustomer
} = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer);

router.patch('/:id/deactivate', deactivateCustomer);
router.patch('/:id/reactivate', reactivateCustomer);

module.exports = router;
