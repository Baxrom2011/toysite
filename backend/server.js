const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes - HAMMASI BORLIGINI TEKSHIRING
app.use('/api/products', require('./routes/products'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/cash', require('./routes/cash'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/customers', require('./routes/customers'));  // ✅ BOR
app.use('/api/debts', require('./routes/debts'));          // ✅ BOR

app.get('/', (req, res) => {
    res.json({
        message: 'Toys Store API is running!',
        endpoints: {
            products: '/api/products',
            sales: '/api/sales',
            cash: '/api/cash',
            reports: '/api/reports',
            customers: '/api/customers',
            debts: '/api/debts'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
