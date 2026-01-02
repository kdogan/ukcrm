const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getSettings,
  updateSettings,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getTestUsers
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.get('/test-users', getTestUsers); // Test-User für Development
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken); // Refresh token endpoint (public)
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

module.exports = router;
