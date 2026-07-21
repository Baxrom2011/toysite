const express = require('express');
const router = express.Router();
const { getCashData, addCashEntry } = require('../controllers/cashController');

router.get('/', getCashData);
router.post('/', addCashEntry);

module.exports = router;