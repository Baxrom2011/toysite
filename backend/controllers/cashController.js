const CashEntry = require('../models/CashEntry');
const CashBalance = require('../models/CashBalance');

exports.getCashData = async (req, res) => {
  try {
    const balance = await CashBalance.findOne();
    const entries = await CashEntry.find().sort({ createdAt: -1 });
    res.json({ balance: balance ? balance.balance : 0, entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCashEntry = async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    if (!['kirim', 'chiqim'].includes(type)) {
      return res.status(400).json({ message: 'Type must be kirim or chiqim' });
    }
    
    const now = new Date();
    const dateStr = now.getDate().toString().padStart(2,'0') + '.' + (now.getMonth()+1).toString().padStart(2,'0');

    const entry = new CashEntry({ date: dateStr, type, amount, note: note || '' });
    await entry.save();

    let balance = await CashBalance.findOne();
    if (!balance) {
      balance = new CashBalance({ balance: 0 });
    }
    
    if (type === 'kirim') {
      balance.balance += amount;
    } else {
      if (balance.balance < amount) {
        return res.status(400).json({ message: 'Kassada yetarli mablag\' yo\'q' });
      }
      balance.balance -= amount;
    }
    await balance.save();

    res.status(201).json({ entry, balance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};