// =============================================================================
// PACKAGES
// =============================================================================
const jwt = require('jsonwebtoken');
// =============================================================================
// CREDENTIALS
// =============================================================================
const credentials     = require('../config/credentials');
// =============================================================================
// HELPERS
// =============================================================================
const h_response     = require('../helpers/response');
const h_validation   = require('../helpers/validation');
// =============================================================================
// SERVICES
// =============================================================================
const { 
    backUserService, 
    backApplicationService,
    agentDiscountService,
    backMarketplaceService,
} = require('../services/manager');
// =============================================================================
// EXPORTS
// =============================================================================
/**
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* @returns 
*/
const isAuthAdmin = async(req, res, next) =>{
    
    let token = getAccessToken(req);
    if (!token) {
        
        return res.status(403).send( h_response.request( false, { token: null, error: null }, 403, "Error: Authorize Request", "A token is required for authentication" ) );
    }
    else{
        
        await validAccessToken(req, token).then( (valid_result) => {
            
            req.auth = valid_result.body;
            next();
        }).catch ( (valid_error) =>{
            
            return res.status(valid_error.status).send(valid_error);
        });
    }
    
};
/**
* 
* @param {*} req 
* @param {*} res 
* @param {*} next 
* @returns 
*/
const isAuthStore = async(req, res, next) =>{
    
    let token = getAccessToken(req);
    
    if( !req.query.app_version || ( req.query.app_version && process.env.APP_VERSION != decodeURI( req.query.app_version ) ) ){
        
        res.status(400).send( h_response.request( false, {}, 400, "Error: Store Version", "Store version not updated, please reload the page" ) );
    }
    else if (token == undefined) {
        
        req.auth = { token: null, data: null };
        next();
    }
    else{
        
        await validAccessToken(req, token).then( (valid_result) => {
            
            req.auth = valid_result.body;
            next();
        }).catch ( (valid_error) =>{
            
            return res.status(403).send(valid_error);
        });
    }
};
// =============================================================================
// GENERAL FUNCTIONS
// =============================================================================
/**
* 
* @param {*} req 
* @returns 
*/
function getAccessToken(req){
    
    let token = req.body?.token ? req.body.token : undefined; 
    token = !token && req.query && req.query.token ? decodeURI( req.query.token ) : token;
    token = !token && req.headers && req.headers['x-access-token'] ? req.headers['x-access-token'] : token;
    
    token = token ? h_validation.evalString( token ) : token;
    token = token == null || token == "null" ? undefined : token;
    
    return token;
};
/**
 * 
 * @param {*} req 
 * @param {*} user_info 
 * @param {*} get_marketplace 
 * @returns 
 */
async function validAccessUser(req, user_info){
    
    return new Promise(async (resolve, reject) => {
        
        try {
            let user_result = await backUserService.findOne({ _id: user_info.user, status: 'active' });
            
            if( user_result.success && user_result.body != null ){
                
                resolve( h_response.request( true, { token: user_info, app_version: process.env.APP_VERSION, user: user_result.body }, 200, "Success: User find", "User found" ) );
                
                // if( user_result.body.role.test_mode || process.env.NODE_ENV == 'developer' || user_result.body.role.endpoints.find( (item_endpoint) => item_endpoint.path == req.baseUrl && item_endpoint.method == req.route.path && item_endpoint.request_method == req.method ) ){
                
                // }
                // else{
                
                //     reject( { status: 401, success: false, message: 'Error: You do not have permissions for this endpoint', data: { token: null, error: null } } );
                // }
            }
            else if( ( user_result.success && user_result.body != null ) || ( marketplace_result.success && marketplace_result.body != null && user_result.success && user_result.body != null ) ){
                
                resolve( h_response.request( true, { token: user_info, app_version: process.env.APP_VERSION, user: user_result.body }, 200, "Success: User find", "User found" ) );
            }
            else {
                
                reject( h_response.request( false, { token: null, error: null }, 403, "Error: Authorize User", "User not exist" ) );
            }
        } catch (process_error) {
            
            reject( h_response.request( false, { token: null, error: process_error }, 400, "Error: Process User", "Error in process user" ) );
        }
    });
};
/**
 * 
 * @param {*} req 
 * @param {*} user_info 
 * @param {*} get_marketplace 
 * @returns 
 */
async function validAccessApplication(req, user_info){
    
    return new Promise(async (resolve, reject) => {
        
        try {
            let application_result = await backApplicationService.findOne({ handle: user_info.handle, host: user_info.access.host, status: 'active' });
            
            if( application_result.success && application_result.body != null ){
                
                let header_origin       = req.headers.origin ? req.headers.origin.replace(/(?:http|https):\/\/+/, "").replace("www.", "") : null;
                let valid_app_version   = req.query.app_version == "null" || !application_result.body.exact_version || ( req.query.app_version != "null" && application_result.body.exact_version && process.env.APP_VERSION == req.query.app_version );
                let valid_header_origin = ( header_origin && header_origin == user_info.access.host ) || ( !header_origin && ( req.query.test_postman == credentials.encrypted.key_test ) );
                // let valid_endpoint      = application_result.body.endpoints.find( (item_endpoint) => item_endpoint.path == req.baseUrl && item_endpoint.method == req.route.path && item_endpoint.request_method == req.method );
                //  valid_app_version && ( application_result.body.test_mode || process.env.NODE_ENV == 'developer' || ( valid_header_origin && valid_endpoint ) )
                if( valid_app_version && ( application_result.body.test_mode || process.env.NODE_ENV == 'developer' || valid_header_origin ) ){
                    
                    resolve( h_response.request( true, { token: user_info, app_version: process.env.APP_VERSION, user: application_result.body }, 200, "Success: Application find", "Application found" ) );
                }
                else if ( !valid_app_version ){

                    reject( h_response.request( false, { token: null, error: null }, 400, "Error: Store Version", "Store version not updated, please reload the page" ) );
                }
                // else if( !valid_header_origin ){
                
                //     reject( h_response.request( false, { token: null, error: null }, 403, "Error: Authorize Application", "You do not have permissions for this endpoint" ) );
                // }
                else{
                    reject( h_response.request( false, { token: null, error: null }, 403, "Error: Authorize Application", "Unauthorized Application for this request" ) );
                }
            }
            else{
                
                reject( h_response.request( false, { token: null, error: null }, 403, "Error: Authorize Application", "Application not exist" ) );
            }
        } catch (process_error) {
            
            reject( h_response.request( false, { token: null, error: process_error }, 400, "Error: Process Application", "Error in process application" ) );
        }
    });
};
/**
* 
* @param {*} req 
* @param {*} token 
* @returns 
*/
function validAccessToken(req, token ){
    
    return new Promise(async (resolve, reject) => {
        
        let split_token     = token.split(' ');
        token               = split_token[0];
        let user_info       = h_validation.verifyToken( token );
        
        user_info = !user_info.access?.is_app && user_info.access?.handle != 'customer' ? h_validation.verifyToken( token, false ) : user_info;
        
        if( !user_info.access && user_info.success != undefined ){
            
            return reject( h_response.request( false, { token: null, data: user_info.data }, 403, "Error: Authentication", user_info.message ) );
        }
        else if( !user_info.access && user_info.success == undefined ){
            
            return reject( h_response.request( false, user_info, 403, "Error: Authentication", "Verified Credentials failed" ) );
        }
        else if( user_info.access.is_app == false && ( req.query.app_version == "null" || ( req.query.app_version != "null" && process.env.APP_VERSION == req.query.app_version ) ) ){
            
            await validAccessUser(req, user_info).then( (valid_result) => {
                
                resolve( valid_result );
            }).catch( (valid_error) => {
                
                reject( valid_error );
            });
        }
        else if( user_info.access.is_app ){
            
            await validAccessApplication(req, user_info).then( (valid_result) => {
                
                resolve( valid_result );
            }).catch( (valid_error) => {
                
                reject( valid_error );
            });
        }
        else{
            
            return reject( h_response.request( false, { token: null, data: null }, 400, "Error: Store Version", "Store version not updated, please reload the page" ) );
        }
    });
};
module.exports = {
    isAuthAdmin,
    isAuthStore
};