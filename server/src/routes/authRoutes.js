const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
