const express = require('express');
const router = express.Router();
const { 
    getSales, 
    addSale, 
    getSalesByCustomer,
    getCustomerCash,
    getCustomerDebtSummary,
    makeCashPayment
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

// 🆕 Kassa to'lovi (qarzni to'lash)
router.post('/customer/:customerId/pay', makeCashPayment);

module.exports = router;
