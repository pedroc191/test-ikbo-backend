// =============================================================================
// PACKAGES
// =============================================================================
// =============================================================================
// HELPERS
// =============================================================================
const h_format      = require('../../helpers/format');
const h_response    = require('../../helpers/response');
const h_crud        = require('../../helpers/crud');
const h_array       = require('../../helpers/array');
// =============================================================================
// SERVICES
// =============================================================================
const {
    backProductService
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
        let find_query      = h_format.findQuery( req.body.query?.id_handle || req.params.id_handle );

        delete req.body.query.id_handle;
        find_query = h_array.sortByProperty( { ...find_query, ...req.body.query }, 0 );

        let find_document   = await h_crud.findDocument( 'Product', backProductService, find_query, req.body.fields, req.body.options );
        if( find_document.success ){

            if( req.body.query.sku ){

                find_document.variants = find_document.variants.filter( (item) => item.sku === req.body.query.sku );
            }
            res.status(200).json( find_document );
        }
        else{

            res.status(400).send( find_document );	
        }
        
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Product find', 'Error in process' ) );
    }
};
/**
* 
* @param {*} req 
* @param {*} res 
*/
async function listDocuments(req, res){
    
    let list_documents = await h_crud.listDocuments('Product', backProductService, req.body.query, req.body.fields, req.body.options);
    if( list_documents.success ) {
        
        res.status(200).json( list_documents );
    }
    else {
        
        res.status(400).send( list_documents );
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
        listDocuments
    },
    put:{
    },
    delete:{
    }
};