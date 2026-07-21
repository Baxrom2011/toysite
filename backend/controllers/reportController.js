const Sale = require('../models/Sale');
const Product = require('../models/Product');
const CashEntry = require('../models/CashEntry');
const CashBalance = require('../models/CashBalance');

// Get statistics for reports
exports.getReports = async (req, res) => {
  try {
    // Daily sales (last 7 days) – mock or real aggregation
    const sales = await Sale.find();
    // For simplicity, we return mock data for charts (or you can aggregate)
    // But we'll compute real data where possible

    // Top products
    const products = await Product.find();
    const sorted = products.sort((a, b) => b.sold - a.sold).slice(0, 5);

    // Low stock (threshold = 30)
    const lowStock = products.filter(p => (p.arrived - p.sold) < 30);

    // Daily chart data (last 7 days from sales)
    const today = new Date();
    const labels = [];
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.getDate().toString().padStart(2,'0') + '.' + (d.getMonth()+1).toString().padStart(2,'0');
      labels.push(dateStr);
      const dailyTotal = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.total, 0);
      dailyData.push(dailyTotal);
    }

    // Monthly data (last 7 months) – mock or real
    const monthLabels = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul'];
    // For simplicity, we use mock monthly data, but you can aggregate from sales

    res.json({
      daily: { labels, data: dailyData },
      monthly: { labels: monthLabels, data: [15000000, 18000000, 22000000, 19000000, 21000000, 25000000, 18500000] }, // mock
      topProducts: sorted.map(p => ({ name: p.name, sold: p.sold })),
      lowStock: lowStock.map(p => ({ name: p.name, stock: p.arrived - p.sold })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};