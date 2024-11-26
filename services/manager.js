// =============================================================================
// DATA LAYERS
// =============================================================================
const syncLayer   = require( '../data-layer/mongoose/sync.layer' );
const crudLayer   = require( '../data-layer/mongoose/crud.layer' );
// =============================================================================
// CONFIG MODULE - POPULATES
// =============================================================================
const configPopulate = require( '../data-layer/mongoose/populates/config-module.populate' );
// =============================================================================
// INVENTORY MODULE - POPULATES
// =============================================================================
const inventoryPopulate = require( '../data-layer/mongoose/populates/inventory-module.populate' );
// =============================================================================
// PRODUCT MODULE - POPULATES
// =============================================================================
const productsPopulate = require( '../data-layer/mongoose/populates/product-module.populate' );
// =============================================================================
// USER MODULE - POPULATES
// =============================================================================
const usersPopulate = require( '../data-layer/mongoose/populates/user-module.populate' );

module.exports = {
    // =============================================================================
    // CONFIG MODULE - POPULATES
    // =============================================================================
    backApplicationService          : new syncLayer( require('../models/config-module/application.model')               , configPopulate.back_application_populate ),
    backEndpointService             : new crudLayer( require('../models/config-module/endpoint.model')                  , configPopulate.back_endpoint_populate ),
    backRoleService                 : new crudLayer( require('../models/config-module/role.model')                      , configPopulate.back_role_populate ),
    // =============================================================================
    // INVENTORY MODULE - POPULATES
    // =============================================================================
    backInventoryLocationService    : new crudLayer( require('../models/config-module/inventory-location.model')        , inventoryPopulate.back_inventory_location_populate ),
    backInventoryVariantService     : new crudLayer( require('../models/inventory-module/inventory-variant.model')      , inventoryPopulate.back_inventory_variant_populate ),
    backInventoryTransactionService : new crudLayer( require('../models/inventory-module/inventory-transaction.model')  , inventoryPopulate.back_inventory_transaction_populate ),
    // =============================================================================
    // PRODUCT MODULE - POPULATES
    // =============================================================================
    backProductService              : new syncLayer( require('../models/product-module/product.model')                  , productsPopulate.back_product_populate ),
    backProductVariantsService      : new syncLayer( require('../models/product-module/product-variant.model')          , productsPopulate.back_product_variant_populate ),
    // =============================================================================
    // USER MODULE - POPULATES
    // =============================================================================
    backUserService                 : new syncLayer( require('../models/user-module/user.model')                        , usersPopulate.back_user_populate )
}