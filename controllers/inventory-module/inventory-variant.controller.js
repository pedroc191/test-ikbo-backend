// =============================================================================
// PACKAGES
// =============================================================================
const moment = require('moment');
// =============================================================================
// HELPERS
// =============================================================================
const h_format      = require('../../helpers/format');
const h_validation  = require('../../helpers/validation');
const h_response    = require('../../helpers/response');
const h_crud        = require('../../helpers/crud');
// =============================================================================
// SERVICES
// =============================================================================
const { 
    backInventoryVariantService,
    backProductService,
    backProductVariantsService,
    backInventoryTransactionService
} = require('../../services/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function findDocument(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'id_handle', h_validation.evalString( req.param.id_handle ), h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( { id_handle: req.param.id_handle }, format_data );
        
        if( format_data.is_valid ){
            
            let find_query = h_format.findQuery( format_data.body_object.id_handle );
            let find_document = await h_crud.findDocument('Inventory Variant', backInventoryVariantService, find_query, req.body.fields, req.body.options);
            if (find_document.success ) {
                
                res.status(200).json( find_document );
            }
            else {
                
                res.status(400).send( find_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Variant fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Variant find', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function listDocuments(req, res){
    
    let list_documents = await h_crud.listDocuments('Inventory Variant', backInventoryVariantService, req.body.query, req.body.fields, req.body.options );
    if ( list_documents.success ) {
        
        list_documents.body = list_documents.body.map( (item) => {
                
                return {
                    _id: item._id,
                    variant: item.variant,
                    sku: item.variant.sku,
                    location: item.location,
                    location_name: item.location.name,
                    quantity: item.quantity,
                    expired_at: item.expired_at,
                    exipred_status: moment( item.expired_at ).isBefore( moment() ) ? 'expired' : moment( item.expired_at ).diff( moment(), 'days' ) <= 3 ? 'to expire' : 'active'
                };
        });
        res.status(200).json( list_documents );
    }
    else {
        
        res.status(400).send( list_documents );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function createDocument(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'variant'            , h_validation.evalObjectId( req.body.variant, null )       , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , null ),
            h_format.objectValidField( 'location'           , h_validation.evalObjectId( req.body.location, null )      , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , null ),
            h_format.objectValidField( 'quantity'           , h_validation.evalInt( req.body.quantity, 0 )              , h_format.fields.types.number.name     , h_format.fields.types.number.operators.not_equal      , 0 ),
            h_format.objectValidField( 'expired_at'         , h_validation.evalDate( req.body.expired_at, null )        , h_format.fields.types.date.name       , h_format.fields.types.date.operators.not_equal        , null ),
            h_format.objectValidField( 'transaction_type'   , h_validation.evalString( req.body.transaction_type, null ), h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , null )
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            let find_query = { 
                variant: format_data.body_object.variant, 
                location: format_data.body_object.location, 
                expired_at: format_data.body_object.expired_at, 
                status: 'active' 
            };
            let transaction_type = format_data.body_object.transaction_type;
            delete format_data.body_object.transaction_type;
            let create_document = await h_crud.createDocument( 'Inventory Variant', backInventoryVariantService, find_query, format_data.body_object, true );
            if (create_document.success ) {
                
                let find_product = await h_crud.findDocument('Product', backProductService, { variants: { $elemMatch: { $eq: format_data.body_object.variant } } } );
                if (find_product.success) { 
                    
                    let find_variant = find_product.body.variants.find( (item) => item._id.toString() === format_data.body_object.variant );
                    
                    let variant_totals      = { total_stock: 0, total_weight: 0 };
                    let expired_at_product  = null;
                    for (const item_variant of find_product.body.variants) {
                        
                        let acum_quntity = 0;
                        let expired_at_variant = null;
                        for (const item_inventory of item_variant.inventory_items) {
                            
                            if( !moment( item_inventory.expired_at ).isBefore( moment() ) ){
                                
                                acum_quntity += item_inventory.quantity;
                                expired_at_variant = expired_at_variant == null || ( expired_at_variant != null && moment( item_inventory.expired_at ).isBefore( expired_at_variant ) ) ? item_inventory.expired_at : expired_at_variant;
                            }
                        }
                        variant_totals.total_stock      += acum_quntity + ( format_data.body_object.variant == item_variant._id.toString() ? format_data.body_object.quantity : 0 );
                        variant_totals.total_weight     += ( acum_quntity * item_variant.weight ) + ( format_data.body_object.variant == item_variant._id.toString() ? ( format_data.body_object.quantity * item_variant.weight ) : 0 );

                        if( format_data.body_object.variant === item_variant._id.toString() ){
                            acum_quntity += ( format_data.body_object.variant == item_variant._id.toString() ? format_data.body_object.quantity : 0 );
                            find_variant.inventory_items.push( create_document.body._id.toString() );
                            await h_crud.updateDocument('Product Variant', backProductVariantsService, { _id: item_variant._id.toString() }, { inventory_quantity: acum_quntity, inventory_items: find_variant.inventory_items, expired_at: expired_at_variant });
                        }
                        else{

                            await h_crud.updateDocument('Product Variant', backProductVariantsService, { _id: item_variant._id.toString() }, { inventory_quantity: acum_quntity, expired_at: expired_at_variant });
                        }
                        expired_at_product = expired_at_product == null || ( expired_at_product != null && moment( expired_at_variant ).isBefore( expired_at_product ) ) ? expired_at_variant : expired_at_product;
                    }
                    let update_product      = await h_crud.updateDocument('Product', backProductService, { _id: find_product.body._id }, { total_stock: variant_totals.total_stock, total_weight: variant_totals.total_weight, expired_at: expired_at_product });
                    
                    let format_transaction  = {
                        inventory_item: create_document.body._id.toString(),
                        quantity: format_data.body_object.quantity,
                        transaction_type: transaction_type
                    };
                    let create_transaction = await h_crud.createDocument('Inventory Transaction', backInventoryTransactionService, { _id: create_document.body._id.toString() }, format_transaction );
                    if ( update_product.success && create_transaction.success ) {
                        
                        res.status(200).json( create_document );
                    }
                    else {
                        
                        let field_errors = [ update_product, create_transaction ].filter( (item) => !item.success );
                        res.status(400).send( h_response.request( false, field_errors, 400, 'Error: Validate Data', 'Error in process' ) );
                    }
                }
                else {
                    
                    res.status(400).send( create_document );
                }
            }
            else{
                
                res.status(400).send( create_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Variant fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Variant create', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function updateDocumentStatus(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'id_handle'  , h_validation.evalString( req.param.id_handle )    , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'status'     , h_validation.evalString( req.body.status, null )  , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( {...req.body, id_handle: req.param.id_handle }, format_data );
        
        if( format_data.is_valid ) {
            
            let find_query = h_format.findQuery( format_data.body_object.id_handle );
            delete format_data.body_object.id_handle;
            
            let update_document = await h_crud.updateDocument('Inventory Variant', backInventoryVariantService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Variant fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Variant update status', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function deleteDocument(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'id_handle', h_validation.evalString( req.param.id_handle ), h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( { id_handle: req.param.id_handle }, format_data );
        
        if( format_data.is_valid ){
            
            let find_query      = h_format.findQuery( format_data.body_object.id_handle );
            let delete_document = await h_crud.deleteDocument('Inventory Variant', backInventoryVariantService, find_query);
            if (delete_document.success) {
                
                res.status(200).json( delete_document );
            }
            else {
                
                res.status(400).send( delete_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Variant fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Variant delete', 'Error in process' ) );
    }
};
// =============================================================================
// GENERAL FUNCTIONS
// =============================================================================
// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
    get:{
    },
    post:{
        findDocument,
        listDocuments,
        createDocument
    },
    put:{
        updateDocumentStatus
    },
    delete:{
        deleteDocument
    }
};