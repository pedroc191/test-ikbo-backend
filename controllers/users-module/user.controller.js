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
// =============================================================================
// CREDENTIALS
// =============================================================================
const credentials 	= require('../../config/credentials');
// =============================================================================
// SERVICES
// =============================================================================
const {
    backUserService
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
            h_format.objectValidField( 'password'   , h_validation.evalArray( req.body.email, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            format_data.body_object.email = format_data.body_object.email.toLowerCase();
            let user_result = await backUserService.findOne({ email: format_data.body_object.email });
            
            if( user_result.success && user_result.body != null && user_result.body.status == 'inactive' ){
                
                res.status(400).send( h_response.request(false, user_result, 400, "Error: User Login", "Inactive customer to interact with the store, please contact your sales agent") );
            }
            else if( user_result.success && user_result.body != null && bcrypt.compareSync(form_data.password, user_result.body.password) ){
                
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
                        email           : form_data.email.toLowerCase(),
                        token           : token_login
                    }
                };
                res.status(200).json( h_response.request( true, login_data, 200, "Success: User Login", `Welcome ${ user_result.body.customer.first_name } ${ user_result.body.customer.last_name }` ) );
            }
            else if( ( user_result.success && user_result.body == null ) || ( user_result.success && user_result.body != null && !bcrypt.compareSync(form_data.password, user_result.body.password) ) ){
                
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
async function create(req, res){
    
    try {
        let format_data = [
            h_format.objectValidField( 'role'       , h_validation.evalString( req.body.role, '' )      , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'first_name' , h_validation.evalArray( req.body.first_name, '' ) , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'last_name'  , h_validation.evalArray( req.body.last_name, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'email'      , h_validation.evalArray( req.body.email, '' )      , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'password'   , h_validation.evalArray( req.body.password, '' )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let user_result = await backUserService.findOne({ email: format_data.body_object.email.toLowerCase() });
            
            if( user_result.success && user_result.body == null ){
                
                let user_created = await backUserService.create(format_data.body_object);
                
                if( user_created.success ){
                    
                    res.status(200).json( h_response.request( true, user_created.body, 200, "Success: User Create", "User created successfully" ) );
                }
                else{
                    
                    res.status(400).send( h_response.request( false, user_created, 400, "Error: User Create", "User not created" ) );
                }
            }
            else if ( !user_result.success ){
                
                res.status(400).send( h_response.request( false, user_result, 400, "Error: User Create", "User not created, user find failed" ) );
            }
            else{
                
                res.status(400).send( h_response.request( false, user_result, 400, "Error: User Create", "User already exist" ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: User Create", `User not created, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Create", "User not created, process failed" ) );
    }
};
async function update(req, res){

    try {
        let format_data = [
            h_format.objectValidField( 'id_email'   , h_validation.evalString( req.body.id_email, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'first_name' , h_validation.evalArray( req.body.first_name, '' ) , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'last_name'  , h_validation.evalArray( req.body.last_name, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let find_query = h_format.findQuery( format_data.body_object.id_email, 'email' );   
            let data_update = { 
                first_name  : format_data.body_object.first_name, 
                last_name   : format_data.body_object.last_name
            };
            let user_updated = await backUserService.update(find_query, data_update);
            
            if( user_updated.success ){
                
                res.status(200).json( h_response.request( true, user_updated.body, 200, "Success: User Update", "User updated" ) );
            }
            else{
                
                res.status(400).send( h_response.request( false, user_updated, 400, "Error: User Update", "User not updated" ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: User Update", `User not updated, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Update", "User not updated, process failed" ) );
    }
};
async function updateStatus(req, res){

    try {
        let format_data = [
            h_format.objectValidField( 'id_email'   , h_validation.evalString( req.body.id_email, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'status'     , h_validation.evalArray( req.body.status, '' )     , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let find_query      = h_format.findQuery( format_data.body_object.id_email, 'email' );
            let user_updated    = await backUserService.updateStatus(find_query, format_data.body_object.status);
            
            if( user_updated.success ){
                
                res.status(200).json( h_response.request( true, user_updated.body, 200, "Success: User Update", "User updated" ) );
            }
            else{
                
                res.status(400).send( h_response.request( false, user_error, 400, "Error: User Update", "User not updated" ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: User Update", `User not updated, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Update", "User not updated, process failed" ) );
    }
};
async function updatePassword(req, res){

    try {
        let format_data = [
            h_format.objectValidField( 'id_email', h_validation.evalString( req.body.email, '' )    , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
            h_format.objectValidField( 'password', h_validation.evalArray( req.body.password, '' )  , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, '' ),
        ];
        format_data = h_validation.evalFields( req.body, format_data );
        
        if( format_data.is_valid ){
            
            let find_query      = h_format.findQuery( format_data.body_object.id_email, 'email' );
            let user_result = await backUserService.findOne( find_query );
            
            if( user_result.success ){
                
                let user_updated = await backUserService.update(find_query, { password: format_data.body_object.password });
                
                if( user_updated.success ){
                    
                    res.status(200).json( h_response.request( false, user_updated.body, 200, "Success: Password Update", "User updated successfully" ) );
                }
                else{
                    
                    res.status(400).send( h_response.request( false, user_updated, 400, "Error: Password Update", "User not updated" ) );
                }
            }
            else{
                
                res.status(400).send( h_response.request( false, user_result, 400, "Error: Password Update", "Password not Updated, user not found" ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_data.valid_fields, 400, "Error: Password Update", `Password not updated, fields required not validated` ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, "Error: User Update", "User not updated, process failed" ) );
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
        create
    },
    put:{
        update,
        updateStatus,
        updatePassword
    },
    delete:{
    }
};