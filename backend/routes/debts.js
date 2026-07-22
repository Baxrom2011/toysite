const express = require('express');
const router = express.Router();
const { 
    getDebts, 
    payDebt, 
    getCustomerDebts,
    deleteDebt,
    getDebtStats,
    restoreDebt
} = require('../controllers/debtController');

router.get('/', getDebts);
router.get('/stats', getDebtStats);
router.get('/customer/:customerId', getCustomerDebts);
router.post('/:id/pay', payDebt);
router.post('/:id/restore', restoreDebt);
router.delete('/:id', deleteDebt);

module.exports = router;
