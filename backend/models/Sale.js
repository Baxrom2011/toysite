const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer' 
    },
    product: { 
        type: String, 
        required: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    },
    qty: { 
        type: Number, 
        required: true 
    },
    total: { 
        type: Number, 
        required: true 
    },
    paymentType: { 
        type: String, 
        enum: ['cash', 'debt'], 
        default: 'cash' 
    },
    date: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String, 
        default: '' 
    },
    datetime: { 
        type: String, 
        default: '' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
