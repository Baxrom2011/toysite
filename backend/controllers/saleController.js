const Sale = require('../models/Sale');
const Product = require('../models/Product');
const CashEntry = require('../models/CashEntry');
const CashBalance = require('../models/CashBalance');
const Debt = require('../models/Debt');

// ============================================================
// BARCHA SOTUVLARNI OLISH
// ============================================================
exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// YANGI SOTUV QO'SHISH
// ============================================================
exports.addSale = async (req, res) => {
    try {
        const { 
            customerId, productId, qty, price, total, 
            paymentType, paymentAmount, debtAmount,
            date, time, datetime
        } = req.body;
        
        // Mahsulotni tekshirish
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Mahsulot topilmadi' });
        }

        // Qoldiqni tekshirish
        const stock = product.arrived - product.sold;
        if (qty > stock) {
            return res.status(400).json({ 
                message: `Yetarli mahsulot yo'q (qoldiq: ${stock})` 
            });
        }

        // Qoldiqni hisoblash
        const remainingStock = stock - qty;
        
        // Mahsulotni yangilash
        product.sold += qty;
        await product.save();

        // Sana va vaqt
        const now = new Date();
        const dateStr = date || (now.getDate().toString().padStart(2,'0') + '.' + (now.getMonth()+1).toString().padStart(2,'0'));
        const timeStr = time || (now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0'));
        const datetimeStr = datetime || (dateStr + ' ' + timeStr);
        
        // Sotuvni saqlash
        const sale = new Sale({
            customerId: customerId || null,
            product: product.name,
            productId: product._id,
            qty,
            total,
            paymentType: paymentType || 'cash',
            date: dateStr,
            time: timeStr,
            datetime: datetimeStr,
        });
        await sale.save();

        // ============================================================
        // NAQD TO'LOV
        // ============================================================
        if (paymentType === 'cash' || (paymentType === 'debt' && paymentAmount > 0)) {
            const cashAmount = paymentType === 'cash' ? total : paymentAmount;
            
            const cashEntry = new CashEntry({
                date: dateStr,
                time: timeStr,
                datetime: datetimeStr,
                type: 'kirim',
                amount: cashAmount,
                note: `Sotuv ${product.name} (${paymentType === 'cash' ? 'naqd' : 'qisman to\'lov'})`
            });
            await cashEntry.save();

            let balance = await CashBalance.findOne();
            if (!balance) {
                balance = new CashBalance({ balance: 0 });
            }
            balance.balance += cashAmount;
            await balance.save();
        }

        // ============================================================
        // QARZ
        // ============================================================
        if (paymentType === 'debt' && debtAmount > 0) {
            const debt = new Debt({
                customerId: customerId,
                saleId: sale._id,
                product: product.name,
                total: debtAmount,
                paid: 0,
                remaining: debtAmount,
                status: 'active',
                date: dateStr,
                time: timeStr,
                datetime: datetimeStr,
            });
            await debt.save();
        }

        // ============================================================
        // JAVOB
        // ============================================================
        res.status(201).json({ 
            success: true,
            message: 'Sotuv saqlandi',
            sale: sale,
            product: product,
            remainingStock: remainingStock,
            date: dateStr,
            time: timeStr,
            datetime: datetimeStr
        });
        
    } catch (error) {
        console.error('Sale error:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ============================================================
// MIJOZ BO'YICHA SOTUVLARNI OLISH (🆕 YANGI)
// ============================================================
exports.getSalesByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { date } = req.query;
        
        let filter = { customerId: customerId };
        if (date) {
            filter.date = date;
        }
        
        const sales = await Sale.find(filter).sort({ createdAt: -1 });
        const total = sales.reduce((sum, s) => sum + s.total, 0);
        
        res.json({
            customerId: customerId,
            date: date || 'all',
            sales: sales,
            total: total,
            count: sales.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// MIJOZ BO'YICHA KASSA MA'LUMOTI (🆕 YANGI)
// ============================================================
exports.getCustomerCash = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { date } = req.query;
        
        let filter = { 
            customerId: customerId,
            paymentType: 'cash'
        };
        if (date) {
            filter.date = date;
        }
        
        const sales = await Sale.find(filter);
        const totalCash = sales.reduce((sum, s) => sum + s.total, 0);
        
        res.json({
            customerId: customerId,
            date: date || 'all',
            totalCash: totalCash,
            count: sales.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// MIJOZ BO'YICHA QARZ MA'LUMOTI (🆕 YANGI)
// ============================================================
exports.getCustomerDebtSummary = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const debts = await Debt.find({ 
            customerId: customerId,
            status: 'active'
        });
        
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        
        res.json({
            customerId: customerId,
            totalDebt: totalDebt,
            debts: debts,
            count: debts.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
