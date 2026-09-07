const express = require('express');
const router = express.Router();
const { requestReturn, getMyReturns } = require('../controllers/returnController');
const { protect } = require('../middleware/auth');

router.use(protect); // All return routes require auth

router.post('/', requestReturn);
router.get('/my-returns', getMyReturns);

module.exports = router;
