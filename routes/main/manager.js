const router = require('express').Router();

const userRouter                    = require('../user-module/user.router');
const roleRouter                    = require('../config-module/role.router');
const seedRouter                    = require('../config-module/seed.router');
const applicationRouter             = require('../config-module/application.router');
const endpointRouter                = require('../config-module/endpoint.router');

const productRouter                 = require('../product-module/product.router');
const inventoryLocationRouter       = require('../inventory-module/inventory-location.router');
const inventoryVariantRouter        = require('../inventory-module/inventory-variant.router');
const inventoryTransactionRouter    = require('../inventory-module/inventory-transaction.router');

router.use( '/users'				    , userRouter );
router.use( '/roles'				    , roleRouter );
router.use( '/seeds'		            , seedRouter );
router.use( '/applications'		        , applicationRouter );
router.use( '/endpoints'			    , endpointRouter );

router.use( '/products'			        , productRouter );
router.use( '/inventory-locations'		, inventoryLocationRouter );
router.use( '/inventory-variants'		, inventoryVariantRouter );
router.use( '/inventory-transactions'	, inventoryTransactionRouter );

module.exports = router;