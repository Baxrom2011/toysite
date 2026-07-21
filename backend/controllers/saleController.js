const Sale = require('../models/Sale');
const Product = require('../models/Product');
const CashEntry = require('../models/CashEntry');
const CashBalance = require('../models/CashBalance');

// GET all sales
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST new sale
exports.addSale = async (req, res) => {
  try {
    const { productId, qty, price, buyer } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const stock = product.arrived - product.sold;
    if (qty > stock) {
      return res.status(400).json({ message: `Yetarli mahsulot yo'q (qoldiq: ${stock})` });
    }

    const total = qty * price;
    // Update product
    product.sold += qty;
    await product.save();

    // Create sale
    const now = new Date();
    const dateStr = now.getDate().toString().padStart(2,'0') + '.' + (now.getMonth()+1).toString().padStart(2,'0');
    const sale = new Sale({
      product: product.name,
      qty,
      total,
      buyer: buyer || 'Anonim',
      date: dateStr,
    });
    await sale.save();

    // Add cash entry
    const cashEntry = new CashEntry({
      date: dateStr,
      type: 'kirim',
      amount: total,
      note: `Sotuv ${product.name} (${buyer || 'Anonim'})`,
    });
    await cashEntry.save();

    // Update cash balance
    let cashBalance = await CashBalance.findOne();
    if (!cashBalance) {
      cashBalance = new CashBalance({ balance: 0 });
    }
    cashBalance.balance += total;
    await cashBalance.save();

    res.status(201).json({ sale, product, cashBalance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};