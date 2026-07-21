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

// Barcha qarzlarni olish
router.get('/', getDebts);

// Qarz statistikasi
router.get('/stats', getDebtStats);

// Mijozning qarzlarini olish
router.get('/customer/:customerId', getCustomerDebts);

// Qarzni to'lash
router.post('/:id/pay', payDebt);

// Qarzni qayta tiklash
router.post('/:id/restore', restoreDebt);

// Qarzni o'chirish
router.delete('/:id', deleteDebt);

module.exports = router;
