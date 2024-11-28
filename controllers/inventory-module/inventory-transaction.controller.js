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
    backInventoryTransactionService,
    backInventoryVariantService,
    backProductService,
    backProductVariantsService
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
            let find_document = await h_crud.findDocument('Inventory Transaction', backInventoryTransactionService, find_query, req.body.fields, req.body.options);
            if (find_document.success ) {
                
                res.status(200).json( find_document );
            }
            else {
                
                res.status(400).send( find_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Transaction fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Transaction find', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function listDocuments(req, res){
    
    let list_documents = await h_crud.listDocuments('Inventory Transaction', backInventoryTransactionService, req.body.query, req.body.fields, req.body.options );
    if ( list_documents.success ) {
        
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
            h_format.objectValidField( 'inventory_item'     , h_validation.evalObjectId( req.body.inventory_item, null ), h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , null ),
            h_format.objectValidField( 'quantity'           , h_validation.evalInt( req.body.quantity, 0 )              , h_format.fields.types.number.name     , h_format.fields.types.number.operators.not_equal      , 0 ),
            h_format.objectValidField( 'transaction_type'   , h_validation.evalString( req.body.transaction_type, null ), h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , null )
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let find_query = h_format.findQuery( format_data.body_object.inventory_item );
            let create_document = await h_crud.createDocument( 'Inventory Transaction', backInventoryTransactionService, find_query, format_data.body_object, true );
            if (create_document.success ) {
                
                let find_inventory_variant = await h_crud.findDocument('Inventory Variant', backInventoryVariantService, { _id: create_document.body.inventory_item } );
                if ( find_inventory_variant.success) { 
                    
                    let find_product = await h_crud.findDocument('Product', backProductService, { variants: { $elemMatch: { $eq: find_inventory_variant.body.variant._id.toString() } } } );
                    if( find_product.success ) {
                        
                        let new_quantity    = ( format_data.body_object.transaction_type == 'in' ? format_data.body_object.quantity : format_data.body_object.quantity * -1 );
                        let variant_totals  = { total_stock: 0, total_weight: 0 };
                        let expired_at_product = null;
                        for (const item_variant of find_product.body.variants) {
                            
                            let acum_quntity = 0;
                            let expired_at_variant = null;
                            for (const item_inventory of item_variant.inventory_items) {
                                
                                if( !moment( item_inventory.expired_at ).isBefore( moment() ) ){
                                    
                                    acum_quntity += item_inventory.quantity;
                                    expired_at_variant = expired_at_variant == null || ( expired_at_variant != null && moment( item_inventory.expired_at ).isBefore( expired_at_variant ) ) ? item_inventory.expired_at : expired_at_variant;
                                }
                            }
                            expired_at_product = expired_at_product == null || ( expired_at_product != null && moment( expired_at_variant ).isBefore( expired_at_product ) ) ? expired_at_variant : expired_at_product;
                            variant_totals.total_stock      += acum_quntity + ( find_inventory_variant.body.variant._id.toString() == item_variant._id.toString() ? new_quantity : 0 );
                            variant_totals.total_weight     += ( acum_quntity * item_variant.weight ) + ( find_inventory_variant.body.variant._id.toString() == item_variant._id.toString() ? ( new_quantity * item_variant.weight ) : 0 );
                            await h_crud.updateDocument('Product Variant', backProductVariantsService, { _id: item_variant._id.toString() }, { inventory_quantity: acum_quntity, expired_at: expired_at_variant });
                        }
                        let update_inventory_variant    = await h_crud.updateDocument('Inventory Variant', backInventoryVariantService, { _id: format_data.body_object.inventory_item }, { quantity: ( find_inventory_variant.body.quantity + new_quantity ) });
                        let update_product              = await h_crud.updateDocument('Product', backProductService, { _id: find_product.body._id }, { total_stock: variant_totals.total_stock, total_weight: variant_totals.total_weight, expired_at: expired_at_product });
                        
                        if ( update_product.success && update_inventory_variant.success ) {
                            
                            res.status(200).json( create_document );
                        }
                        else {
                            
                            let field_errors = [ update_product, update_inventory_variant ].filter( (item) => !item.success );
                            res.status(400).send( h_response.request( false, field_errors, 400, 'Error: Validate Data', 'Error in process' ) );
                        }
                    }
                    else{
                        
                        res.status(400).send( find_product );
                    }
                }
                else {
                    res.status(400).send( find_inventory_variant );
                }
            }
            else{
                
                res.status(400).send( create_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Transaction fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Transaction create', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function updateDocument(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'id_handle'      , h_validation.evalString( req.param.id_handle )        , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'name'           , h_validation.evalString( req.body.name, '' )          , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'first_name'     , h_validation.evalString( req.body.first_name, '' )    , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'last_name'      , h_validation.evalString( req.body.last_name, '' )     , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'phone'          , h_validation.evalString( req.body.phone, '' )         , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'address_1'      , h_validation.evalString( req.body.address_1, '' )     , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'address_2'      , h_validation.evalString( req.body.address_2, '' )     , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'country'        , h_validation.evalString( req.body.country, '' )       , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'country_code'   , h_validation.evalString( req.body.country_code, '' )  , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'state'          , h_validation.evalString( req.body.state, '' )         , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'state_code'     , h_validation.evalString( req.body.state_code, '' )    , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'city'           , h_validation.evalString( req.body.city, '' )          , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
            h_format.objectValidField( 'zip'            , h_validation.evalString( req.body.zip, '' )           , h_format.fields.types.string.name     , h_format.fields.types.string.operators.not_equal      , '' ),
        ];
        format_data = h_validation.evalFields( {...req.body, id_handle: req.param.id_handle }, format_data );
        
        if( format_data.is_valid ) {
            
            let find_query = h_format.findQuery( format_data.body_object.id_handle );
            delete format_data.body_object.id_handle;
            
            format_data.body_object.handle = format_data.body_object.name != null ? h_format.slug( format_data.body_object.name ) : null;
            
            let update_document = await h_crud.updateDocument('Inventory Transaction', backInventoryTransactionService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Transaction fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Transaction update', 'Error in process' ) );
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
            
            let update_document = await h_crud.updateDocument('Inventory Transaction', backInventoryTransactionService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Transaction fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Transaction update status', 'Error in process' ) );
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
            let delete_document = await h_crud.deleteDocument('Inventory Transaction', backInventoryTransactionService, find_query);
            if (delete_document.success) {
                
                res.status(200).json( delete_document );
            }
            else {
                
                res.status(400).send( delete_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Transaction fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Transaction delete', 'Error in process' ) );
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
        updateDocument,
        updateDocumentStatus
    },
    delete:{
        deleteDocument
    }
};