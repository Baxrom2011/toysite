const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' },
    product: { type: String, required: true },
    total: { type: Number, required: true },
    paid: { type: Number, default: 0 },
    remaining: { type: Number, required: true },
    status: { type: String, enum: ['active', 'paid'], default: 'active' },
    date: { type: String, required: true },      // DD.MM
    time: { type: String, default: '' },         // 🆕 HH:MM (soniya)
    datetime: { type: String, default: '' },     // 🆕 DD.MM HH:MM
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
