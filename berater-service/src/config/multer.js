const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads-Verzeichnis erstellen falls nicht vorhanden
const uploadsDir = path.join(__dirname, '../../uploads/contracts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage-Konfiguration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Format: Vertragsid_datum.ext
    // z.B.: 507f1f77bcf86cd799439011_20250125143022.pdf
    const contractId = req.params.id; // Contract ID aus URL-Parameter
    const now = new Date();

    // Datum formatieren: YYYYMMDDHHmmss
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateStr = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const ext = path.extname(file.originalname);
    const filename = `${contractId}_${dateStr}${ext}`;

    cb(null, filename);
  }
});

// Datei-Filter (nur bestimmte Dateitypen erlauben)
const fileFilter = (req, file, cb) => {
  // Erlaubte Dateitypen
  const allowedTypes = [
    // Bilder
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Dokumente
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Ungültiger Dateityp. Erlaubt sind: Bilder (JPG, PNG, GIF, WebP) und Dokumente (PDF, Word, Excel, TXT, CSV)'), false);
  }
};

// Multer-Konfiguration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Max 10MB pro Datei
  },
  fileFilter: fileFilter
});

module.exports = upload;
