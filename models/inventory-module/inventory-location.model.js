const mongoose      = require('mongoose');

let inventoryLocationSchema = mongoose.Schema({
    name            : { type: String    , default: null },
    handle          : { type: String    , default: null },
    first_name      : { type: String    , default: null }, 
    last_name       : { type: String    , default: null }, 
    phone           : { type: String    , default: null },  
    address_1       : { type: String    , default: null }, 
    address_2       : { type: String    , default: null }, 
    country         : { type: String    , default: null }, 
    country_code    : { type: String    , default: null }, 
    state           : { type: String    , default: null }, 
    state_code      : { type: String    , default: null }, 
    city            : { type: String    , default: null }, 
    zip             : { type: String    , default: null },
    
    created_at      : { type: Date      , default: Date.now }, 
    updated_at      : { type: Date      , default: Date.now }, 
    deleted_at      : { type: Date      , default: null }, 
    deleted         : { type: Boolean   , default: false },
    status          : { type: String    , default: 'active' }
});

module.exports = mongoose.model( 'back_inventory_location', inventoryLocationSchema );