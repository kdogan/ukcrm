const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads Ordner für Messages erstellen
const messagesUploadDir = path.join(__dirname, '../../uploads/messages');
if (!fs.existsSync(messagesUploadDir)) {
  fs.mkdirSync(messagesUploadDir, { recursive: true });
}

// Storage für Message-Bilder
const messageImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, messagesUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'message-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter für Bilder
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilder sind erlaubt (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Multer für Message-Bilder
const uploadMessageImage = multer({
  storage: messageImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  uploadMessageImage
};
