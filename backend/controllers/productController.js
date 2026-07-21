const Product = require('../models/Product');

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST new product
exports.addProduct = async (req, res) => {
  try {
    const { name, arrived, price } = req.body;
    const product = new Product({ name, arrived, sold: 0, price });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, arrived, price } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (name) product.name = name;
    if (arrived !== undefined) product.arrived = arrived;
    if (price) product.price = price;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};