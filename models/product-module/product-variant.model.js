const mongoose = require('mongoose');

let productVariantSchema = mongoose.Schema({
    product             : { type: mongoose.Schema.Types.ObjectId    , default: null, ref: 'back_product' },
    sku                 : { type: String                            , default: null },
    title               : { type: String                            , default: null },
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
        url     : { type: String , default: null },
    }], default: [] },
    image               : { type: {
        desktop : { type: { 
            alt             : { type: String, default: null }, 
            src             : { type: String, default: null },
            width           : { type: Number, default: 1440 }, //1083
            height          : { type: Number, default: 1440 }, //1440
            sizes           : [{ type: Number, default: [1600, 1400, 1200] }]
        }, default: null },
        mobile  : { type: { 
            alt             : { type: String, default: null }, 
            src             : { type: String, default: null }, 
            width           : { type: Number, default: 480 }, //480
            height          : { type: Number, default: 480 }, //360
            sizes           : [{ type: Number, default: [1000, 800, 700, 600] }]
        }, default: null },
    }, default: null },
    grams               : { type: Number                            , default: 0 },
    weight              : { type: Number                            , default: 0 },
    weight_unit         : { type: String                            , default: null },
    inventory_policy    : { type: String                            , default: null },
    requires_shipping   : { type: Boolean                           , default: true },
    inventory_quantity  : { type: Number                            , default: 0 },
    expired_at          : { type: Date                              , default: Date.now },
    is_expired          : { type: Boolean                           , default: false },
    inventory_items     : [{ type: mongoose.Schema.Types.ObjectId   , default: null, ref: 'back_inventory_variant' }],

    created_at          : { type: Date                              , default: Date.now }, 
    updated_at          : { type: Date                              , default: Date.now }, 
    deleted_at          : { type: Date                              , default: null }, 
    deleted             : { type: Boolean                           , default: false },
    status_created      : { type: String                            , default: null },
    status              : { type: String                            , default: 'active' }
});

module.exports = mongoose.model( 'back_product_variant', productVariantSchema );