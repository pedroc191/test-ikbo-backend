// =============================================================================
// GENERAL FUNCTIONS
// =============================================================================
/**
* 
* @param {*} data 
* @param {*} status 
* @param {*} title 
* @param {*} message 
* @returns 
*/
function request( success, data, status, title, message ){
    
    let response = { 
        success     : success, 
        status      : status,
        title       : title,
        message     : message, 
        body        : data,
        app_version : process.env.APP_VERSION 
    };
    if( !success ){
        
        if( !data ){
            
            data = { title: "Error Connection", message: "Waiting time expired, please try again" };
        }
        response = { 
            success     : success, 
            status      : data?.status ? data.status : status,
            title       : data?.title ? data.title : title,
            message     : `${ data.message ? data.message.toString().replace(/\\/g, '/') : message }`, 
            body        : data?.stack ? data.stack.replace(/\\/g, '/').replace(/(')/g, '').replace(/(')/g, '').split('\n') : data,
            app_version : process.env.APP_VERSION 
        };
    }
    return response;
};
// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
    request,
}