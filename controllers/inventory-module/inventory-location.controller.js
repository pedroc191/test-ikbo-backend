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
    backInventoryLocationService
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
            let find_document = await h_crud.findDocument('Inventory Location', backInventoryLocationService, find_query, req.body.fields, req.body.options);
            if (find_document.success ) {
                
                res.status(200).json( find_document );
            }
            else {
                
                res.status(400).send( find_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Location fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Location find', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function listDocuments(req, res){
    
    let list_documents = await h_crud.listDocuments('Inventory Location', backInventoryLocationService, req.body.query, req.body.fields, req.body.options );
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
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            format_data.body_object.handle = format_data.body_object.name != null ? h_format.slug( format_data.body_object.name ) : null;
            
            let create_document = await h_crud.createDocument( 'Inventory Location', backInventoryLocationService, { name: format_data.body_object.name }, format_data.body_object, false );
            if (create_document.success ) {
                
                res.status(200).json( create_document );
            }
            else {
                
                res.status(400).send( create_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Location fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Location create', 'Error in process' ) );
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
            
            let update_document = await h_crud.updateDocument('Inventory Location', backInventoryLocationService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Location fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Location update', 'Error in process' ) );
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
            
            let update_document = await h_crud.updateDocument('Inventory Location', backInventoryLocationService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Location fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Location update status', 'Error in process' ) );
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
            let delete_document = await h_crud.deleteDocument('Inventory Location', backInventoryLocationService, find_query);
            if (delete_document.success) {
                
                res.status(200).json( delete_document );
            }
            else {
                
                res.status(400).send( delete_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Inventory Location fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Inventory Location delete', 'Error in process' ) );
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