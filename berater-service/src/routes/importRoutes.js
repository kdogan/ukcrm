const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const {
  importCustomersFromExcel,
  importMetersFromExcel
} = require('../controllers/importController');

// Multer Konfiguration für Excel-Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Akzeptiere nur Excel-Dateien
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xls|xlsx)$/)) {
    cb(null, true);
  } else {
    cb(new Error('Nur Excel-Dateien (.xls, .xlsx) sind erlaubt'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// POST /api/import/customers - Importiere Kunden aus Excel
router.post('/customers', authenticate, upload.single('file'), importCustomersFromExcel);

// POST /api/import/meters - Importiere Zähler aus Excel
router.post('/meters', authenticate, upload.single('file'), importMetersFromExcel);

module.exports = router;
