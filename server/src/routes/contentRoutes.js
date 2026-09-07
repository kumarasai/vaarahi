const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:key', getContent);
router.post('/:key', protect, authorize('admin', 'sub-admin'), updateContent);

module.exports = router;
