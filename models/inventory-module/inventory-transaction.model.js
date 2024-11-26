const mongoose = require('mongoose');

let inventoryTransactionSchema = mongoose.Schema({
    inventory_item  : { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'back_inventory_variant' },
    quantity        : { type: Number                        , default: 0 },
    transaction_type: { type: String                        , default: 'in', enum: ['in', 'out', 'expired'] },

    created_at      : { type: Date                          , default: Date.now }, 
    updated_at      : { type: Date                          , default: Date.now }, 
    deleted_at      : { type: Date                          , default: null }, 
    deleted         : { type: Boolean                       , default: false },
    status          : { type: String                        , default: 'active' }
});

module.exports = mongoose.model( 'back_inventory_transaction', inventoryTransactionSchema );