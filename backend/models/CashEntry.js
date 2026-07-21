const mongoose = require('mongoose');

const cashEntrySchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, default: '' },        // 🆕
    datetime: { type: String, default: '' },    // 🆕
    type: { type: String, enum: ['kirim', 'chiqim'], required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CashEntry', cashEntrySchema);
