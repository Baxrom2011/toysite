const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product: { type: String, required: true },
  qty: { type: Number, required: true },
  total: { type: Number, required: true },
  buyer: { type: String, default: 'Anonim' },
  date: { type: String, required: true }, // format: DD.MM
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);