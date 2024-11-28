const mongoose = require('mongoose');

let productVariantSchema = mongoose.Schema({
    product             : { type: mongoose.Schema.Types.ObjectId    , default: null, ref: 'back_product' },
    sku                 : { type: String                            , default: null, unique: true },
    title               : { type: String                            , default: null },
    handle              : { type: String                            , default: null, unique: true },
    brand               : { type: {
        name    : { type: String, default: null },
        handle  : { type: String, default: null }
    }, default: null },
    product_type        : { type: {
        name    : { type: String, default: null },
        handle  : { type: String, default: null }
    }, default: null },
    price               : { type: Number                            , default: 0 },
    options             : { type: [{
        name    : { type: String , default: null }, 
        handle  : { type: String , default: null }, 
        value   : { type: String , default: null },
    }], default: [] },
    grams               : { type: Number                            , default: 0 },
    weight              : { type: Number                            , default: 0 },
    weight_unit         : { type: String                            , default: 'kg' },
    inventory_policy    : { type: String                            , default: 'deny' },
    requires_shipping   : { type: Boolean                           , default: true },
    inventory_quantity  : { type: Number                            , default: 0 },
    expired_at          : { type: Date                              , default: Date.now },
    inventory_items     : [{ type: mongoose.Schema.Types.ObjectId   , default: null, ref: 'back_inventory_variant' }],
    currency_code       : { type: String                            , default: 'COP' },
    
    created_at          : { type: Date                              , default: Date.now }, 
    updated_at          : { type: Date                              , default: Date.now }, 
    deleted_at          : { type: Date                              , default: null }, 
    deleted             : { type: Boolean                           , default: false },
    status_created      : { type: String                            , default: null },
    status              : { type: String                            , default: 'active' }
});

module.exports = mongoose.model( 'back_product_variant', productVariantSchema );