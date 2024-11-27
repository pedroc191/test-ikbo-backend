// =============================================================================
// PACKAGES
// =============================================================================
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');

// =============================================================================
// HELPERS
// =============================================================================
const h_format      = require('../../helpers/format');
const h_validation  = require('../../helpers/validation');
const h_response    = require('../../helpers/response');
const h_crud        = require('../../helpers/crud');
// =============================================================================
// CREDENTIALS
// =============================================================================
const credentials 	= require('../../config/credentials');
// =============================================================================
// SERVICES
// =============================================================================
const {
    backUserService,
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
async function login(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'email'      , h_validation.evalString( req.body.email, '' ) , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'password'   , h_validation.evalString( req.body.password, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            format_data.body_object.email = format_data.body_object.email.toLowerCase();
            let user_result = await backUserService.findOne({ email: format_data.body_object.email });
            
            if( user_result.success && user_result.body != null && user_result.body.status == 'inactive' ){
                
                res.status(400).send( h_response.request(false, user_result, 400, "Error: User Login", "Inactive customer to interact with the store, please contact your sales agent") );
            }
            else if( user_result.success && user_result.body != null && bcrypt.compareSync(format_data.body_object.password, user_result.body.password) ){
                
                let token_data      = { 
                    user: user_result.body._id, 
                    access: {  
                        role_handle: user_result.body.role.handle, 
                        is_app: false 
                    }
                }
                const token_login   = jwt.sign( token_data, credentials.encrypted.key_session );
                backUserService.update({ _id: user_result.body._id }, { token_login: token_login });
                
                let login_data = { 
                    user    : {
                        id              : user_result.body._id.toString(),
                        name            : `${ user_result.body.first_name } ${ user_result.body.last_name }`, 
                        email           : format_data.body_object.email.toLowerCase(),
                        token           : token_login
                    }
                };
                res.status(200).json( h_response.request( true, login_data, 200, "Success: User Login", `Welcome ${ user_result.body.first_name } ${ user_result.body.last_name }` ) );
            }
            else if( ( user_result.success && user_result.body == null ) || ( user_result.success && user_result.body != null && !bcrypt.compareSync(format_data.body_object.password, user_result.body.password) ) ){
                
                res.status(400).send( h_response.request( false, user_result, 400, "Error: User Login", "Invalid Credentials" ) );
            }
            else{
                
                res.status(400).send( h_response.request( false, user_result, 400, "Error: User Login", "User not login, user not found" ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: User Login", `User not login, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Login", "User not login, process failed" ) );
    }
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function logout(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'token'      , h_validation.evalString( req.body.token, '' ) , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let data_token = await jwt.verify( format_data.body_object.token, credentials.encrypted.key_session, { ignoreExpiration: true });  
            
            let user_updated = await backUserService.update({ email: data_token.email }, { token_login: null });
            
            if( user_updated.success ){
                
                res.status(200).json( h_response.request( true, user_updated, 200, "Success: User Logout", "" ) );
            }
            else{
                
                res.status(400).send( h_response.request( false, user_updated, 400, "Error: User Logout", "An unexpected error has occurred, please try again." ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: User Logout", `User not logout, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Logout", "User not logout, process failed" ) );
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
            h_format.objectValidField( 'role'       , h_validation.evalString( req.body.role, null )        , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'first_name' , h_validation.evalString( req.body.first_name, null )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'last_name'  , h_validation.evalString( req.body.last_name, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'email'      , h_validation.evalString( req.body.new_email, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'password'   , h_validation.evalString( req.body.new_password, null ), h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
        ];
        console.log( req.body );
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let find_query = h_format.findQuery( format_data.body_object.role );
            let role_result = await h_crud.findDocument('Role', backRoleService, find_query, { _id: 1 });
            
            if( role_result.success ){
                
                format_data.body_object.role    = role_result.body._id;
                let create_document = await h_crud.createDocument( 'User', backUserService, { email: format_data.body_object.email.toLowerCase() }, format_data.body_object, true );
                if (create_document.success ) {
                    
                    create_document.body = {
                        id: create_document.body._id,
                        name: `${ create_document.body.first_name } ${ create_document.body.last_name }`,
                        email: create_document.body.email
                    };
                    res.status(200).json( create_document );
                }
                else{
                    
                    res.status(400).send( create_document );
                }
            }
            else {
                
                res.status(400).send( role_result );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: User Create", `User not created, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Create", "User not created, process failed" ) );
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
            h_format.objectValidField( 'id_email'   , h_validation.evalString( req.body.id_email, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'first_name' , h_validation.evalString( req.body.first_name, '' ) , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'last_name'  , h_validation.evalString( req.body.last_name, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( {...req.body, id_email: req.param.id_email }, format_data );
        
        if( format_data.is_valid ) {
            
            let find_query = h_format.findQuery( format_data.body_object.id_email, 'email' );
            delete format_data.body_object.id_email;
            
            let find_document = await h_crud.findDocument('User', backUserService, find_query, { _id: 1 });
            if (find_document.success) {
                
                let update_document = await h_crud.updateDocument('User', backUserService, find_query, format_data.body_object);
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
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'User fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Update", "User not updated, process failed" ) );
    }
}
;/**
* 
* @param {*} req 
* @param {*} res 
*/
async function updateDocumentStatus(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'id_email'  , h_validation.evalString( req.param.id_email )    , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'status'     , h_validation.evalString( req.body.status, null )  , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( {...req.body, id_email: req.param.id_email }, format_data );
        
        if( format_data.is_valid ) {
            
            let find_query = h_format.findQuery( format_data.body_object.id_email, 'email' );
            delete format_data.body_object.id_email;
            
            let update_document = await h_crud.updateDocument('User', backUserService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'User fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: User update status', 'Error in process' ) );
    }
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function updatePassword(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'id_email'  , h_validation.evalString( req.param.id_email )    , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'password'     , h_validation.evalString( req.body.password, null )  , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( {...req.body, id_email: req.param.id_email }, format_data );
        
        if( format_data.is_valid ) {
            
            let find_query = h_format.findQuery( format_data.body_object.id_email, 'email' );
            delete format_data.body_object.id_email;
            
            let update_document = await h_crud.updateDocument('User', backUserService, find_query, format_data.body_object);
            if (update_document.success) {
                
                res.status(200).json( update_document );
            }
            else {
                
                res.status(400).send( update_document );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, 'Error: Validate Data', 'User fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: User update status', 'Error in process' ) );
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
        login,
        logout,
        createDocument
    },
    put:{
        updateDocument,
        updateDocumentStatus,
        updatePassword
    },
    delete:{
    }
};