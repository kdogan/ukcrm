const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContract,
  createContract,
  updateContract,
  updateContractStatus
} = require('../controllers/contractController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
  .get(getContracts)
  .post(createContract);

router.route('/:id')
  .get(getContract)
  .put(updateContract);

router.patch('/:id/status', updateContractStatus);

module.exports = router;
