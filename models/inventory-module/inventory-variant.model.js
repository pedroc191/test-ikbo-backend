const mongoose = require('mongoose');

let inventoryVariantSchema = mongoose.Schema({
    variant     : { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'back_product_variant' },
    location    : { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'back_inventory_location' },
    quantity    : { type: Number                        , default: 0 },
    min_quantity: { type: Number                        , default: 0 },
    max_quantity: { type: Number                        , default: 0 },

    expired_at  : { type: Date                          , default: Date.now },
    is_expired  : { type: Boolean                       , default: false },
    created_at  : { type: Date                          , default: Date.now }, 
    updated_at  : { type: Date                          , default: Date.now }, 
    deleted_at  : { type: Date                          , default: null }, 
    deleted     : { type: Boolean                       , default: false },
    status      : { type: String                        , default: 'active' }
});

module.exports = mongoose.model( 'back_inventory_variant', inventoryVariantSchema );