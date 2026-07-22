const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Mijoz ismi kiritilishi shart' });
        }
        const customer = new Customer({ name, phone: phone || '', address: address || '' });
        await customer.save();
        res.status(201).json({
            success: true,
            message: 'Mijoz qo\'shildi',
            customer: customer
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Mijoz topilmadi' });
        }
        await Customer.findByIdAndDelete(id);
        res.json({ 
            success: true,
            message: 'Mijoz o\'chirildi' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
