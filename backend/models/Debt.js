const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    saleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Sale' 
    },
    product: { 
        type: String, 
        required: true 
    },
    total: { 
        type: Number, 
        required: true 
    },
    paid: { 
        type: Number, 
        default: 0 
    },
    remaining: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['active', 'paid'], 
        default: 'active' 
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

module.exports = mongoose.model('Debt', debtSchema);
