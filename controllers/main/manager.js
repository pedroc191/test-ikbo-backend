module.exports = {
    applicationController           : require('../config-module/application.controller'),
    endpointController              : require('../config-module/endpoint.controller'),
    roleController                  : require('../config-module/role.controller'),

    productController               : require('../product-module/product.controller'),

    inventoryLocationController     : require('../inventory-module/inventory-location.controller'),
    inventoryVariantController      : require('../inventory-module/inventory-variant.controller'),
    inventoryTransactionController  : require('../inventory-module/inventory-transaction.controller'),

    userController                  : require('../user-module/user.controller'),
};