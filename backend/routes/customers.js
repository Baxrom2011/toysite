const express = require('express');
const router = express.Router();
const { getCustomers, addCustomer, deleteCustomer } = require('../controllers/customerController');

// Barcha mijozlarni olish
router.get('/', getCustomers);

// Yangi mijoz qo'shish
router.post('/', addCustomer);

// Mijozni o'chirish
router.delete('/:id', deleteCustomer);

module.exports = router;
