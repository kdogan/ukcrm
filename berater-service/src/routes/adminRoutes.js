const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  getUserStats,
  resetPassword,
  getAllUpgradeRequests,
  getUpgradeRequest,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  getUpgradeRequestStats
} = require('../controllers/adminController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

// Alle Routes benötigen Authentifizierung und Superadmin-Rechte
router.use(authenticate);
router.use(requireSuperAdmin);

// Statistiken
router.get('/stats', getUserStats);
router.get('/upgrade-requests/stats', getUpgradeRequestStats);

// User Management
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// User Actions
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.patch('/users/:id/reset-password', resetPassword);

// Upgrade Request Management
router.get('/upgrade-requests', getAllUpgradeRequests);
router.get('/upgrade-requests/:id', getUpgradeRequest);
router.patch('/upgrade-requests/:id/approve', approveUpgradeRequest);
router.patch('/upgrade-requests/:id/reject', rejectUpgradeRequest);

module.exports = router;
