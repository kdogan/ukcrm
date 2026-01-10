const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  getMinStartDateForMeter
} = require('../controllers/contractController');
const { authenticate } = require('../middleware/auth');
const { checkContractLimit } = require('../middleware/packageLimits');
const { checkFileUploadPermission } = require('../middleware/checkFileUploadPermission');
const upload = require('../config/multer');

router.use(authenticate);

router.route('/')
  .get(getContracts)
  .post(checkContractLimit, createContract);

// Min-Startdatum für einen Zähler abrufen (muss vor /:id kommen!)
router.get('/meter/:meterId/min-start-date', getMinStartDateForMeter);

router.route('/:id')
  .get(getContract)
  .put(updateContract)
  .delete(deleteContract);

// File upload routes (mit Package-Feature-Prüfung)
router.post('/:id/attachments', checkFileUploadPermission, upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', checkFileUploadPermission, deleteAttachment);
router.get('/:id/attachments/:attachmentId', downloadAttachment); // Download erlaubt für alle (falls vorhanden)

module.exports = router;
