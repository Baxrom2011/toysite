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
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Mahsulot topilmadi' });
        }

        const stock = product.arrived - product.sold;
        if (qty > stock) {
            return res.status(400).json({ 
                message: `Yetarli mahsulot yo'q (qoldiq: ${stock})` 
            });
        }

        const remainingStock = stock - qty;
        product.sold += qty;
        await product.save();

        const now = new Date();
        const dateStr = date || (now.getDate().toString().padStart(2,'0') + '.' + (now.getMonth()+1).toString().padStart(2,'0'));
        const timeStr = time || (now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0'));
        const datetimeStr = datetime || (dateStr + ' ' + timeStr);
        
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

        // Naqd to'lov
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

        // Qarz
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

        res.status(201).json({ 
            success: true,
            message: 'Sotuv saqlandi',
            sale: sale,
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
// 🆕 MIJOZ BO'YICHA SOTUVLARNI OLISH (SANA FILTR BILAN)
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
        
        // Naqd to'lovlar
        const cashSales = sales.filter(s => s.paymentType === 'cash');
        const totalCash = cashSales.reduce((sum, s) => sum + s.total, 0);
        
        // Qarz sotuvlar
        const debtSales = sales.filter(s => s.paymentType === 'debt');
        const totalDebt = debtSales.reduce((sum, s) => sum + s.total, 0);
        
        res.json({
            customerId: customerId,
            date: date || 'all',
            sales: sales,
            total: total,
            count: sales.length,
            cash: {
                count: cashSales.length,
                total: totalCash
            },
            debt: {
                count: debtSales.length,
                total: totalDebt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 🆕 MIJOZ BO'YICHA KASSA MA'LUMOTI
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
            count: sales.length,
            sales: sales
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 🆕 MIJOZ BO'YICHA QARZ MA'LUMOTI (BARCHA SANALARDAN)
// ============================================================
exports.getCustomerDebtSummary = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        // Barcha faol qarzlar (barcha sanalardan)
        const debts = await Debt.find({ 
            customerId: customerId,
            status: 'active'
        }).sort({ createdAt: -1 });
        
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        
        // Har bir sana bo'yicha qarz
        const debtsByDate = {};
        debts.forEach(d => {
            if (!debtsByDate[d.date]) {
                debtsByDate[d.date] = {
                    total: 0,
                    count: 0,
                    debts: []
                };
            }
            debtsByDate[d.date].total += d.remaining;
            debtsByDate[d.date].count += 1;
            debtsByDate[d.date].debts.push(d);
        });
        
        res.json({
            customerId: customerId,
            totalDebt: totalDebt,
            count: debts.length,
            debts: debts,
            byDate: debtsByDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
