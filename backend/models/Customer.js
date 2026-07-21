const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    phone: { 
        type: String, 
        default: '',
        trim: true
    },
    address: { 
        type: String, 
        default: '',
        trim: true
    },
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Customer', customerSchema);
