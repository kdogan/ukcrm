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
const { checkContractLimit } = require('../middleware/packageLimits');

router.use(authenticate);

router.route('/')
  .get(getContracts)
  .post(checkContractLimit, createContract);

router.route('/:id')
  .get(getContract)
  .put(updateContract);

router.patch('/:id/status', updateContractStatus);

module.exports = router;
