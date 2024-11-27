// =============================================================================
// PACKAGES
// =============================================================================
// =============================================================================
// HELPERS
// =============================================================================
const h_format      = require('../../helpers/format');
const h_validation  = require('../../helpers/validation');
const h_response    = require('../../helpers/response');
const h_crud        = require('../../helpers/crud');
const h_array       = require('../../helpers/array');
// =============================================================================
// SERVICES
// =============================================================================
const {
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
        let find_query      = h_format.findQuery( req.body.query?.id_handle || req.params.id_handle );
        
        delete req.body.query.id_handle;
        
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
async function createDocument(req, res){
    try {
        
        let format_product_data = [
            h_format.objectValidField( 'title'          , h_validation.evalString( req.body.title, null )           , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal          , null ),
            h_format.objectValidField( 'description'    , h_validation.evalString( req.body.description, null )     , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal          , null ),
            h_format.objectValidField( 'images'         , h_validation.evalArray( req.body.images, [] )             , h_format.fields.types.array.name  , h_format.fields.types.array.operators.length_greater_than , 0 ),
            h_format.objectValidField( 'brand'          , h_validation.evalString( req.body.brand, null )           , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal          , null ),
            h_format.objectValidField( 'product_type'   , h_validation.evalString( req.body.product_type, null )    , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal          , null ),
            h_format.objectValidField( 'options'        , h_validation.evalArray( req.body.options, [] )            , h_format.fields.types.array.name  , h_format.fields.types.array.operators.length_greater_than , 0 ),
            h_format.objectValidField( 'variants'       , h_validation.evalArray( req.body.variants, [] )           , h_format.fields.types.array.name  , h_format.fields.types.array.operators.length_greater_than , 0 ),
            h_format.objectValidField( 'currency_code'  , h_validation.evalString( req.body.currency_code, null )   , h_format.fields.types.string.name , h_format.fields.types.string.operators.not_equal          , null ),
        ];
        format_product_data = h_validation.evalFields( req.body, format_product_data );
        
        if( format_product_data.is_valid ){
            
            format_product_data.body_object.handle          = h_format.slug( format_product_data.body_object.title );
            format_product_data.body_object.price           = {
                min_price: 0,
                max_price: 0
            };
            format_product_data.body_object.brand           = {
                name: format_product_data.body_object.brand,
                handle: h_format.slug( format_product_data.body_object.brand )
            };
            format_product_data.body_object.product_type    = {
                name: format_product_data.body_object.product_type,
                handle: h_format.slug( format_product_data.body_object.product_type )
            };
            format_product_data.body_object.skus            = [];
            
            let product_images      = formatProductImages( format_product_data.body_object.images );
            let product_options     = formatProductOptions( format_product_data.body_object.options );
            let product_variants    = formatProductVariants( format_product_data.body_object.variants, format_product_data.body_object.skus, format_product_data.body_object.price );
            if( product_images.valid && product_options.valid && product_variants.list.valid ){
                
                format_product_data.body_object.images      = product_images.data;
                format_product_data.body_object.options     = product_options.data;
                format_product_data.body_object.variants    = product_variants.list.data;
                format_product_data.body_object.skus        = product_variants.skus;
                
                let variants_found = await backProductVariantsService.find( { sku: { $in: format_product_data.body_object.skus } }, { sku: 1 } );
                if( variants_found.success && variants_found.body.length == 0 ){
                    let variant_created = await backProductVariantsService.createMany( format_product_data.body_object.variants );
                    if( !variant_created.success ){
                        console.log( variant_created );
                        res.status(400).send( h_response.request( false, variant_created, 400, 'Error Product Request', 'Product Variants not Created') );
                    }
                    else{
                        
                        format_product_data.body_object.variants = variant_created.body.map( (item) => item._id.toString() );
                        let create_document = await h_crud.createDocument( 'Product', backProductService, { handle: format_product_data.body_object.handle }, format_product_data.body_object, true );
                        if (create_document.success ) {
                            
                            res.status(200).json( create_document );
                            await backProductVariantsService.updateMany( { sku: { $in: format_product_data.body_object.skus } }, { product: create_document.body._id.toString() } );
                        }
                        else {
                            
                            res.status(400).send( create_document );
                        }
                    }
                }
                else{
                    
                    res.status(400).send( h_response.request( false, 'Error: Product create', 400, 'Error: Product create', 'Product Variants already exists' ) );
                }
            }
            else{
                
                let valid_fields = [ { product_images: product_images }, { product_options: product_options }, { product_variants: product_variants.list } ].reduce( (previous_item, current_item) => {
                    
                    let object_error = Object.entries( current_item );
                    
                    if( !object_error[0][1].valid ){
                        
                        previous_item.push( { [`${ object_error[0][0] }`]: object_error[0][1].field_error } );
                    }
                    return previous_item;
                }, []);
                res.status(400).send( h_response.request( false, valid_fields, 400, 'Error: Validate Data', 'Product fields required not validated' ) );
            }
        }
        else{
            
            res.status(400).send( h_response.request( false, format_product_data.valid_fields, 400, 'Error: Validate Data', 'Product fields required not validated' ) );
        }
    } catch (process_error) {
        
        res.status(400).send( h_response.request( false, process_error, 400, 'Error: Product create', 'Error in process' ) );
    }
}
// =============================================================================
// GENERAL FUNCTIONS
// =============================================================================
/**
* 
* @param {*} product_images 
* @returns 
*/
function formatProductImages( form_product_images ){
    
    let product_images = { valid: true, field_error: [], data: [] };
    for (const item_image of form_product_images) {
        
        let format_image_data = [
            h_format.objectValidField( 'alt', h_validation.evalString( item_image.alt, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'src', h_validation.evalString( item_image.src, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null )
        ];
        format_image_data = h_validation.evalFields( item_image, format_image_data );
        if( !format_image_data.is_valid ){
            
            product_images.valid = false;
            product_images.field_error.push( format_image_data.valid_fields );
        }
        else{
            
            format_image_data.body_object = {
                desktop : { 
                    alt             : format_image_data.body_object.alt, 
                    src             : format_image_data.body_object.src,
                    width           : 1440,
                    height          : 1440,
                    sizes           : [1600, 1400, 1200]
                },
                mobile  : { 
                    alt             : format_image_data.body_object.alt, 
                    src             : format_image_data.body_object.src, 
                    width           : 480,
                    height          : 480,
                    sizes           : [1000, 800, 700, 600]
                },
            }
            product_images.data.push( format_image_data.body_object );
        }
    }
    return product_images;
};
/**
* 
* @param {*} form_product_options 
* @returns 
*/
function formatProductOptions( form_product_options ){
    
    let product_options = { valid: true, field_error: [], data: [] };
    for (const item_option of form_product_options) {
        
        let format_option_data = [
            h_format.objectValidField( 'name', h_validation.evalString( item_option.name, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'values', h_validation.evalArray( item_option.values, [] )   , h_format.fields.types.array.name, h_format.fields.types.array.operators.length_greater_than, 0 )
        ];
        format_option_data = h_validation.evalFields( item_option, format_option_data );
        if( !format_option_data.is_valid ){
            
            product_options.valid = false;
            product_options.field_error.push( format_option_data.valid_fields );
        }
        else{
            
            let product_option_values = { valid: true, data: [] };
            for (const item_value of format_option_data.body_object.values) {
                
                let format_value_data = [
                    h_format.objectValidField( 'name', h_validation.evalString( item_value, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null )
                ];
                format_value_data = h_validation.evalFields( { name: item_value }, format_value_data );
                if( !format_value_data.is_valid ){
                    
                    product_options.valid = false;
                    product_option_values.valid = false;
                    product_options.field_error.push( format_value_data.valid_fields );
                }
                else{
                    
                    product_option_values.data.push( format_value_data.body_object );
                }
            }
            if( product_option_values.valid ){
                
                format_option_data.body_object = {
                    name: format_option_data.body_object.name,
                    handle: h_format.slug( format_option_data.body_object.name ),
                    values: product_option_values.data.map( (item) => {
                        return {
                            name: item.name,
                            handle: `${ h_format.slug( format_option_data.body_object.name ) }-${ h_format.slug( item.name ) }`
                        };
                    })
                }
                product_options.data.push( format_option_data.body_object );
            }
        }
    }
    return product_options;
};
/**
* 
* @param {*} form_product_variants 
* @param {*} form_prouct_skus 
* @returns 
*/
function formatProductVariants( form_product_variants, form_prouct_skus, form_product_price ){
    
    let product_variants = { valid: true, field_error: [], data: [] };
    for (const item_variant of form_product_variants) {
        
        let format_variant_data = [
            h_format.objectValidField( 'sku', h_validation.evalString( item_variant.sku, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'title', h_validation.evalString( item_variant.title, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'brand', h_validation.evalString( item_variant.brand, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'product_type', h_validation.evalString( item_variant.product_type, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'price', h_validation.evalFloat( item_variant.price, 0 )   , h_format.fields.types.number.name, h_format.fields.types.number.operators.greater_than, 0 ),
            h_format.objectValidField( 'options', h_validation.evalArray( item_variant.options, [] )   , h_format.fields.types.array.name, h_format.fields.types.array.operators.length_greater_than, 0 ),
            h_format.objectValidField( 'image', h_validation.evalObject( item_variant.image, {} )   , h_format.fields.types.object.name, h_format.fields.types.object.operators.not_equal, null ),
            h_format.objectValidField( 'grams', h_validation.evalFloat( item_variant.grams, 0 )   , h_format.fields.types.number.name, h_format.fields.types.number.operators.greater_than, 0 ),
            h_format.objectValidField( 'weight', h_validation.evalFloat( item_variant.weight, 0 )   , h_format.fields.types.number.name, h_format.fields.types.number.operators.greater_than, 0 ),
            h_format.objectValidField( 'weight_unit', h_validation.evalString( item_variant.weight_unit, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'inventory_policy', h_validation.evalString( item_variant.inventory_policy, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'requires_shipping', h_validation.evalBoolean( item_variant.requires_shipping, true )   , h_format.fields.types.boolean.name, h_format.fields.types.boolean.operators.equal, true ),
        ];
        format_variant_data = h_validation.evalFields( item_variant, format_variant_data );
        if( format_variant_data.is_valid ){
            
            form_prouct_skus.push( format_variant_data.body_object.sku );
            
            form_product_price.min_price = form_product_price.min_price === 0 || format_variant_data.body_object.price < form_product_price.min_price ? format_variant_data.body_object.price : form_product_price.min_price;
            form_product_price.max_price = form_product_price.max_price === 0 || format_variant_data.body_object.price > form_product_price.max_price ? format_variant_data.body_object.price : form_product_price.max_price;
            
            format_variant_data.body_object.handle = h_format.slug( format_variant_data.body_object.title );
            format_variant_data.body_object.brand = {
                name: format_variant_data.body_object.brand,
                handle: h_format.slug( format_variant_data.body_object.brand )
            };
            format_variant_data.body_object.product_type = {
                name: format_variant_data.body_object.product_type,
                handle: h_format.slug( format_variant_data.body_object.product_type )
            };
            let format_image_data = [
                h_format.objectValidField( 'alt', h_validation.evalString( format_variant_data.body_object.image.alt, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
                h_format.objectValidField( 'src', h_validation.evalString( format_variant_data.body_object.image.src, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null )
            ];
            format_image_data = h_validation.evalFields( format_variant_data.body_object.image, format_image_data );
            if( !format_image_data.is_valid ){
                
                product_variants.valid = false;
                product_variants.field_error.push( format_image_data.valid_fields );
            }
            let variant_options = formatVariantOptions( format_variant_data.body_object.options );
            if( variant_options.valid ){
                
                format_variant_data.body_object.options = variant_options.data;
            }
            product_variants.data.push( format_variant_data.body_object );
        }
        else{
            
            product_variants.valid = false;
            product_variants.field_error.push( format_variant_data.valid_fields );
        }
    }
    return { list: product_variants, skus: form_prouct_skus };
};
function formatVariantOptions( form_variant_options ){
    
    let variant_options = { valid: true, field_error: [], data: [] };
    for (const item_option of form_variant_options) {
        
        let format_option_data = [
            h_format.objectValidField( 'name', h_validation.evalString( item_option.name, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null ),
            h_format.objectValidField( 'value', h_validation.evalString( item_option.value, null )   , h_format.fields.types.string.name, h_format.fields.types.string.operators.not_equal, null )
        ];
        format_option_data = h_validation.evalFields( item_option, format_option_data );
        if( !format_option_data.is_valid ){
            
            product_variants.valid = false;
            variant_options.valid = false;
            product_variants.field_error.push( format_option_data.valid_fields );
        }
        else{
            
            format_option_data.body_object = {
                name: format_option_data.body_object.name,
                handle: `${ h_format.slug( format_option_data.body_object.name ) }-${ h_format.slug( format_option_data.body_object.value ) }`,
                value: format_option_data.body_object.value
            }
            variant_options.data.push( format_option_data.body_object );
        }
    }
    return variant_options;
}
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
    },
    delete:{
    }
};