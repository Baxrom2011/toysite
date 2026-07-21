const mongoose = require('mongoose');

const cashBalanceSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model('CashBalance', cashBalanceSchema);