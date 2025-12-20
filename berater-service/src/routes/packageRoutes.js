const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  checkUserLimits
} = require('../controllers/packageController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

// Public routes (for viewing available packages)
router.get('/', getAllPackages);
router.get('/:id', getPackage);

// Protected routes for users
router.get('/my/limits', authenticate, checkUserLimits);

// WICHTIG: Die alte /my/upgrade Route wurde entfernt!
// Berater müssen jetzt über /api/upgrade/request einen Upgrade-Request erstellen
// Der Superadmin muss diesen dann über /api/admin/upgrade-requests/:id/approve genehmigen

// Superadmin routes
router.post('/admin/create', authenticate, requireSuperAdmin, createPackage);
router.put('/admin/:id', authenticate, requireSuperAdmin, updatePackage);
router.delete('/admin/:id', authenticate, requireSuperAdmin, deletePackage);

module.exports = router;
