const mongoose      = require('mongoose');

let productSchema = mongoose.Schema({
    title               : { type: String                            , default: null },
    description         : { type: String                            , default: null },
    handle              : { type: String                            , default: null },
    images              : { type: [{
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
    }], default: [] },
    brand               : { type: {
        name    : { type: String, default: null },
        handle  : { type: String, default: null }
    }, default: null },
    product_type        : { type: {
        name    : { type: String, default: null },
        handle  : { type: String, default: null }
    }, default: null },
    options             : { type: [{
        name        : { type: String , default: null },
        handle      : { type: String , default: null },
        values      : { type: [{
            name    : { type: String , default: null },
            handle  : { type: String , default: null },
        }], default: [] },
    }], default: [] },
    skus                : [{ type: String                           , default: null }],
    variants            : [{ type: mongoose.Schema.Types.ObjectId   , default: null, ref: 'back_product_variant' }],
    total_stock         : { type: Number                            , default: 0 },
    total_weight        : { type: Number                            , default: 0 },
    price               : { type: {
        min_price: { type: Number, default: 0 },
        max_price: { type: Number, default: 0 }
    }, default: { min_price: 0, max_price: 0 } },
    expired_at          : { type: Date                              , default: Date.now },
    is_expired          : { type: Boolean                           , default: false },

    created_at          : { type: Date                              , default: Date.now }, 
    updated_at          : { type: Date                              , default: Date.now }, 
    deleted_at          : { type: Date                              , default: null }, 
    deleted             : { type: Boolean                           , default: false },
    status_created      : { type: String                            , default: null },
    status              : { type: String                            , default: 'active' }
});

module.exports = mongoose.model( 'back_product', productSchema );