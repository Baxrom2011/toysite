const Sale = require('../models/Sale');
const Product = require('../models/Product');
const CashEntry = require('../models/CashEntry');
const CashBalance = require('../models/CashBalance');
const Debt = require('../models/Debt');

exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addSale = async (req, res) => {
    try {
        const { 
            customerId, productId, qty, price, total, 
            paymentType, paymentAmount, debtAmount,
            date, time, datetime  // 🆕 QO'SHILD
        } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const stock = product.arrived - product.sold;
        if (qty > stock) {
            return res.status(400).json({ message: `Yetarli mahsulot yo'q (qoldiq: ${stock})` });
        }

        const remainingStock = stock - qty;
        product.sold += qty;
        await product.save();

        // 🆕 Sana va vaqtni ishlatish (agar kelmasa hozirgi vaqt)
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

        // Naqd to'lov
        if (paymentType === 'cash' || (paymentType === 'debt' && paymentAmount > 0)) {
            const cashEntry = new CashEntry({
                date: dateStr,
                time: timeStr,
                datetime: datetimeStr,
                type: 'kirim',
                amount: paymentType === 'cash' ? total : paymentAmount,
                note: `Sotuv ${product.name} (${paymentType === 'cash' ? 'naqd' : 'qisman to\'lov'})`
            });
            await cashEntry.save();

            let balance = await CashBalance.findOne();
            if (!balance) balance = new CashBalance({ balance: 0 });
            balance.balance += paymentType === 'cash' ? total : paymentAmount;
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
            sale, 
            product,
            remainingStock: remainingStock
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
