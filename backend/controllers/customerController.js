const Customer = require('../models/Customer');

// ============================================================
// 1. BARCHA MIJOZLARNI OLISH
// ============================================================
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 2. YANGI MIJOZ QO'SHISH
// ============================================================
exports.addCustomer = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        // Ism majburiy
        if (!name) {
            return res.status(400).json({ message: 'Mijoz ismi kiritilishi shart' });
        }
        
        const customer = new Customer({ 
            name, 
            phone: phone || '', 
            address: address || '' 
        });
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

// ============================================================
// 3. MIJOZNI O'CHIRISH
// ============================================================
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

// ============================================================
// 4. MIJOZNI YANGILASH
// ============================================================
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address } = req.body;
        
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Mijoz topilmadi' });
        }
        
        if (name) customer.name = name;
        if (phone !== undefined) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        
        await customer.save();
        
        res.json({
            success: true,
            message: 'Mijoz yangilandi',
            customer: customer
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ============================================================
// 5. BIRTA MIJOZNI OLISH
// ============================================================
exports.getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Mijoz topilmadi' });
        }
        
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
