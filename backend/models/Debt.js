const express = require('express');
const router = express.Router();
const { getDebts, payDebt, getCustomerDebts, deleteDebt } = require('../controllers/debtController');

router.get('/', getDebts);
router.get('/customer/:customerId', getCustomerDebts);
router.post('/:id/pay', payDebt);
router.delete('/:id', deleteDebt);

module.exports = router;
