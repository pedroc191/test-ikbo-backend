// =============================================================================
// PACKAGES
// =============================================================================
const jwt           = require('jsonwebtoken');
// =============================================================================
// CREDENTIALS
// =============================================================================
const credentials   = require('../../config/credentials');
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
    backApplicationService,
    backRoleService
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
            let find_document = await h_crud.findDocument('Application', backApplicationService, find_query, req.body.fields, req.body.options);
            if (find_document.success ) {
                
                res.status(200).json( find_document );
            }
            else {
                
                res.status(400).send( find_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Application fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Application find', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function listDocuments(req, res){
    
    let list_documents = await h_crud.listDocuments('Application', backApplicationService, req.body.query, req.body.fields, req.body.options );
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
            h_format.objectValidField( 'name'       , h_validation.evalString( req.body.name, null )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , '' ),
            h_format.objectValidField( 'description', h_validation.evalString( req.body.description, null ) , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , '' ),
            h_format.objectValidField( 'host'       , h_validation.evalString( req.body.host, null )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , '' ),
            h_format.objectValidField( 'role'       , h_validation.evalString( req.body.role, null )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , null ),
            h_format.objectValidField( 'test_mode'  , h_validation.evalBoolean( req.body.test_mode, false ) , h_format.fields.types.boolean.name, h_format.fields.types.boolean.operators.not_equal                 , null )
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let find_query = h_format.findQuery( format_data.body_object.role );
            let role_result = await h_crud.findDocument('Role', backRoleService, find_query, { _id: 1 });

            if( role_result.success ){

                format_data.body_object.role    = role_result.body._id;
                format_data.body_object.handle  = format_data.body_object.name != null ? h_format.slug( format_data.body_object.name ) : null;

                let create_document = await h_crud.createDocument( 'Application', backApplicationService, { handle: format_data.body_object.handle }, format_data.body_object, true );
                if (create_document.success ) {
                    
                    const token_login = jwt.sign( { 
                        user    : create_document.body._id.toString(), 
                        handle  : create_document.body.handle, 
                        access  : { host: create_document.body.host, is_app: true }
                    }, credentials.encrypted.key_session );
                    
                    let application_updated = await backApplicationService.update({ _id: create_document.body._id }, { token: token_login });
                    
                    if( application_updated.success && application_updated.body != null ){
                        
                        create_document.body.token = token_login;
                        res.status(200).json( create_document );
                    }
                    else{
                        
                        res.status(400).send( h_response.request( false, application_updated, 400, 'Error: Request', 'Application Created, but not updated token' ) );
                    }
                }
                else {
                    
                    res.status(400).send( create_document );
                }
            }
            else{
                
                res.status(400).send( role_result );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Application fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Application create', 'Error in process' ) );
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
            h_format.objectValidField( 'id_handle'  , h_validation.evalString( req.param.id_handle )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , '' ),
            h_format.objectValidField( 'name'       , h_validation.evalString( req.body.name, null )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , null ),
            h_format.objectValidField( 'description', h_validation.evalString( req.body.description, null ) , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , null ),
            h_format.objectValidField( 'host'       , h_validation.evalString( req.body.host, null )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , null ),
            h_format.objectValidField( 'role'       , h_validation.evalString( req.body.role, null )        , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal                  , null ),
            h_format.objectValidField( 'test_mode'  , h_validation.evalBoolean( req.body.test_mode, false ) , h_format.fields.types.boolean.name, h_format.fields.types.boolean.operators.not_equal                 , null )
        ];
        format_data = h_validation.evalFields( {...req.body, id_handle: req.param.id_handle }, format_data );
        
        if( format_data.is_valid ) {
            
            let find_query = h_format.findQuery( format_data.body_object.id_handle );
            delete format_data.body_object.id_handle;
            
            let find_document = await h_crud.findDocument('Application', backApplicationService, find_query, { _id: 1 });
            if (find_document.success) {
                
                format_data.body_object.handle = format_data.body_object.name != null ? h_format.slug( format_data.body_object.name ) : null;
                
                const token_login = jwt.sign( { 
                    user    : find_document.body._id.toString(), 
                    access  : { 
                        host: format_data.body_object.host, 
                        is_app: true 
                    }
                }, credentials.encrypted.key_session );
                
                format_data.body_object.token = token_login;
                
                let update_document = await h_crud.updateDocument('Application', backApplicationService, find_query, format_data.body_object);
                if (update_document.success) {
                    
                    res.status(200).json( update_document );
                }
                else {
                    
                    res.status(400).send( update_document );
                }
            }
            else {
                
                res.status(400).send( find_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Application fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Application update', 'Error in process' ) );
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
            
            let update_document = await h_crud.updateDocument('Application', backApplicationService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Application fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Application update status', 'Error in process' ) );
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
            
            let find_query = h_format.findQuery( format_data.body_object.id_handle );
            let delete_document = await h_crud.deleteDocument('Application', backApplicationService, find_query);
            if (delete_document.success) {
                
                res.status(200).json( delete_document );
            }
            else {
                
                res.status(400).send( delete_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'Application fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Application delete', 'Error in process' ) );
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