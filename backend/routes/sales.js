const express = require('express');
const router = express.Router();
const { getSales, addSale } = require('../controllers/saleController');

router.get('/', getSales);
router.post('/', addSale);

module.exports = router;