const Debt = require('../models/Debt');
const CashEntry = require('../models/CashEntry');
const CashBalance = require('../models/CashBalance');

// ============================================================
// 1. BARCHA QARZLARNI OLISH
// ============================================================
exports.getDebts = async (req, res) => {
    try {
        const debts = await Debt.find().sort({ createdAt: -1 });
        res.json(debts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 2. QARZNI TO'LASH
// ============================================================
exports.payDebt = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        
        // Qarzni topish
        const debt = await Debt.findById(id);
        if (!debt) {
            return res.status(404).json({ message: 'Qarz topilmadi' });
        }
        
        // Qarz allaqachon to'langanmi?
        if (debt.status === 'paid') {
            return res.status(400).json({ message: 'Bu qarz allaqachon to\'langan' });
        }
        
        // To'lov miqdori qarzdan katta emasligini tekshirish
        if (amount > debt.remaining) {
            return res.status(400).json({ 
                message: `To'lov miqdori qarzdan katta (qoldiq: ${debt.remaining} so'm)` 
            });
        }

        // Qarzni yangilash
        debt.paid += amount;
        debt.remaining -= amount;
        
        // Agar qarz to'liq to'langan bo'lsa, statusni o'zgartirish
        if (debt.remaining === 0) {
            debt.status = 'paid';
        }
        await debt.save();

        // ============================================================
        // KASSAGA QO'SHISH
        // ============================================================
        const now = new Date();
        const dateStr = now.getDate().toString().padStart(2,'0') + '.' + 
                       (now.getMonth()+1).toString().padStart(2,'0');
        const timeStr = now.getHours().toString().padStart(2,'0') + ':' + 
                       now.getMinutes().toString().padStart(2,'0');
        const datetimeStr = dateStr + ' ' + timeStr;

        // CashEntry yaratish
        const cashEntry = new CashEntry({
            date: dateStr,
            time: timeStr,
            datetime: datetimeStr,
            type: 'kirim',
            amount: amount,
            note: `Qarz to'lovi: ${debt.product}`
        });
        await cashEntry.save();

        // Kassa balansini yangilash
        let balance = await CashBalance.findOne();
        if (!balance) {
            balance = new CashBalance({ balance: 0 });
        }
        balance.balance += amount;
        await balance.save();

        // Javob qaytarish
        res.json({ 
            success: true,
            message: 'Qarz to\'landi',
            debt: {
                id: debt._id,
                total: debt.total,
                paid: debt.paid,
                remaining: debt.remaining,
                status: debt.status
            },
            cashEntry: cashEntry,
            balance: balance.balance
        });
        
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ============================================================
// 3. MIJOZNING QARZLARINI OLISH
// ============================================================
exports.getCustomerDebts = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const debts = await Debt.find({ 
            customerId: customerId,
            status: 'active' 
        }).sort({ createdAt: -1 });
        
        // Jami qarzni hisoblash
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        
        res.json({
            customerId: customerId,
            totalDebt: totalDebt,
            debts: debts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 4. QARZNI O'CHIRISH
// ============================================================
exports.deleteDebt = async (req, res) => {
    try {
        const { id } = req.params;
        
        const debt = await Debt.findById(id);
        if (!debt) {
            return res.status(404).json({ message: 'Qarz topilmadi' });
        }
        
        await Debt.findByIdAndDelete(id);
        res.json({ 
            success: true,
            message: 'Qarz o\'chirildi' 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 5. QARZ STATISTIKASI
// ============================================================
exports.getDebtStats = async (req, res) => {
    try {
        const totalDebts = await Debt.find();
        const activeDebts = totalDebts.filter(d => d.status === 'active');
        const paidDebts = totalDebts.filter(d => d.status === 'paid');
        
        // Jami summalar
        const totalAmount = totalDebts.reduce((sum, d) => sum + d.total, 0);
        const totalPaid = totalDebts.reduce((sum, d) => sum + d.paid, 0);
        const totalRemaining = totalDebts.reduce((sum, d) => sum + d.remaining, 0);
        
        // Eng ko'p qarzdor mijozlar
        const customerDebts = {};
        activeDebts.forEach(d => {
            if (!customerDebts[d.customerId]) {
                customerDebts[d.customerId] = 0;
            }
            customerDebts[d.customerId] += d.remaining;
        });
        
        // Top 5 qarzdor
        const topDebtors = Object.entries(customerDebts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([customerId, amount]) => ({ customerId, amount }));
        
        res.json({
            total: {
                count: totalDebts.length,
                amount: totalAmount,
                paid: totalPaid,
                remaining: totalRemaining
            },
            active: {
                count: activeDebts.length,
                remaining: activeDebts.reduce((sum, d) => sum + d.remaining, 0)
            },
            paid: {
                count: paidDebts.length,
                amount: paidDebts.reduce((sum, d) => sum + d.total, 0)
            },
            topDebtors: topDebtors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 6. QARZNI QAYTA TIKLASH
// ============================================================
exports.restoreDebt = async (req, res) => {
    try {
        const { id } = req.params;
        
        const debt = await Debt.findById(id);
        if (!debt) {
            return res.status(404).json({ message: 'Qarz topilmadi' });
        }
        
        if (debt.status !== 'paid') {
            return res.status(400).json({ message: 'Qarz hali to\'lanmagan' });
        }
        
        // Qarzni qayta tiklash
        debt.status = 'active';
        debt.remaining = debt.total - debt.paid;
        await debt.save();
        
        res.json({
            success: true,
            message: 'Qarz qayta tiklandi',
            debt: debt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
