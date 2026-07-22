const express = require('express');
const router = express.Router();
const { 
    getSales, 
    addSale, 
    getSalesByCustomer,
    getCustomerCash,
    getCustomerDebtSummary,
    addCashForCustomer,
    payCustomerDebt
} = require('../controllers/saleController');

// Barcha sotuvlar
router.get('/', getSales);

// Yangi sotuv qo'shish
router.post('/', addSale);

// Mijoz bo'yicha sotuvlar (sana filtri bilan)
router.get('/customer/:customerId', getSalesByCustomer);

// Mijoz bo'yicha kassa
router.get('/customer/:customerId/cash', getCustomerCash);

// Mijoz bo'yicha qarz (barcha sanalardan)
router.get('/customer/:customerId/debt', getCustomerDebtSummary);

// 🆕 Kassa kiritish
router.post('/customer/:customerId/cash', addCashForCustomer);

// 🆕 Qarzni to'lash
router.post('/customer/:customerId/pay', payCustomerDebt);

module.exports = router;
