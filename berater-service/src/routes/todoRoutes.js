const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  generateExpiringContractTodos,
  createSupportTicket,
  getMySupportTickets,
  getSupportTickets,
  respondToSupportTicket,
  getSupportTicketImage,
  getSupportTicketBadgeCount,
  markSupportTicketAsRead,
  getTopics,
  createTopic,
  deleteTopic
} = require('../controllers/todoController');
const { authenticate, requireSuperAdmin, authenticateFromQuery } = require('../middleware/auth');

// Uploads-Verzeichnis erstellen falls nicht vorhanden
const uploadsDir = path.join(__dirname, '../../uploads/support-tickets');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for support ticket images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Nur Bilder sind erlaubt (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// WICHTIG: Image route MUSS VOR router.use(authenticate) stehen!
// Image route uses authenticateFromQuery to accept token from query parameter
router.get('/support-ticket/image/:ticketId/:filename', authenticateFromQuery, getSupportTicketImage);

// Alle anderen Routen verwenden die normale Authentifizierung
router.use(authenticate);

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.post('/generate-expiring', generateExpiringContractTodos);

// Topic Routes
router.route('/topics')
  .get(getTopics)
  .post(createTopic);

router.delete('/topics/:id', deleteTopic);

// Support Ticket Routes
router.post('/support-ticket', upload.array('images', 5), createSupportTicket);
router.get('/my-support-tickets', getMySupportTickets);
router.get('/support-tickets', requireSuperAdmin, getSupportTickets);
router.get('/support-ticket-count', getSupportTicketBadgeCount);
// Berater can close their own tickets, Superadmin can respond and change any status
router.put('/support-ticket/:id/respond', respondToSupportTicket);
router.put('/support-ticket/:id/mark-read', markSupportTicketAsRead);

router.route('/:id')
  .get(getTodo)
  .put(updateTodo)
  .delete(deleteTodo);

router.put('/:id/complete', completeTodo);

module.exports = router;
