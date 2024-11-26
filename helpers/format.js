// =============================================================================
// PACKAGES
// =============================================================================
const slugify 		        = require('slugify');
const removeDiacritics      = require('diacritics').remove;
const mongoose              = require('mongoose');
// =============================================================================
// HANDLERS
// =============================================================================
const h_validation          = require('./validation');
const h_array               = require('./array');
// =============================================================================
// GENERAL FUNCTIONS
// =============================================================================
/**
 * 
 * @param {*} field_value 
 * @param {*} extra_field 
 * @returns 
 */
function findQuery( field_value, extra_field = 'handle' ){
    
    let find_query  = { status: 'active' }
    let object_id   = new mongoose.Types.ObjectId.createFromHexString( field_value );
    if( mongoose.isValidObjectId( field_value ) && object_id && object_id.toString() == field_value ){
        
        find_query._id = field_value;
    }
    else{
        
        find_query[extra_field] = field_value;
    }
    return find_query;
};
/**
* 
* @param {*} details_query 
* @param {*} disjunctive_query 
* @param {*} product_discounts 
* @returns 
*/
function findQueryProducts(id_marketplace, details_query, disjunctive_query, product_discounts = null){
    
    let count_fields        = details_query.reduce( (previous_item, current_item, current_index) => {
        
        if( previous_item.details[current_item.field] ){
            
            previous_item.details[current_item.field] += 1;
            previous_item.repeat_fields = true;
        }
        else {
            
            previous_item.details[current_item.field] = 1;
        }
        return previous_item;
    }, { repeat_fields: false, details: {} });
    
    let search_index_field  = -1;
    let format_query        = details_query.map( (item_query, index_query) => {
        
        let new_query = {};
        if( item_query.field != 'search_field' && ['$regex', '$regex-^', '$regex-+$', '$not-regex'].includes(item_query.operator) ){
            
            let prepend = item_query.operator == '$regex-^' ? '^'     : item_query.operator == '$not-regex' ? '.*' : '';
            let append  = item_query.operator == '$regex-+$' ? '+$'   : item_query.operator == '$not-regex' ? '.*' : '';
            
            let regex_query = { $regex: `${ prepend }${ item_query.value[0] }${ append }`, $options: 'i' };
            
            if( item_query.value.length > 1 ){
                
                regex_query = { $regex: `${ prepend }(${ item_query.value.join('|') })${ append }`, $options: 'i' };
            }
            if( item_query.operator == '$not-regex' ){
                
                new_query[`${ item_query.field }`] = { $not: regex_query };
            }
            else{
                
                new_query[`${ item_query.field }`] = regex_query;
            }
        }
        else if( ['$gte', '$lte'].includes(item_query.operator) ){
            
            new_query[`${ item_query.field }`] = { [item_query.operator]: item_query.value };
        }
        else if( ['$eq', '$ne'].includes(item_query.operator) ){
            
            if( item_query.value.length > 1 ){
                
                new_query[`${ item_query.field }`] = { [item_query.operator == '$eq' ? '$in' : '$nin']: item_query.value };
            }
            else{
                
                new_query[`${ item_query.field }`] = item_query.operator == '$eq' ? item_query.value[0] : { $ne: item_query.value[0] };
            }
        }
        else if( item_query.field != 'options' && ['$in', '$nin'].includes(item_query.operator) ){
            
            new_query[`${ item_query.field }`] = { [item_query.operator]: item_query.value };
        }
        if( ['tags'].includes(item_query.field) && count_fields.details[item_query.field] && count_fields.details[item_query.field] == 1 ){
            
            new_query[`${ item_query.field }`] = { 
                $elemMatch: { 
                    handle: new_query[`${ item_query.field }`] 
                } 
            };
        }
        else if( ['tags'].includes(item_query.field) && count_fields.details[item_query.field] && count_fields.details[item_query.field] > 1 ){
            
            if( new_query[`${ item_query.field }`].$elemMatch ){
                
                new_query[`${ item_query.field }`].$elemMatch[ disjunctive_query ? '$or' : '$and' ].push( { 
                    handle: new_query[`${ item_query.field }`] 
                } );
            }
            else{
                
                new_query[`${ item_query.field }`] = { 
                    $elemMatch: { 
                        [ disjunctive_query ? '$or' : '$and' ] : [ 
                            { 
                                handle: new_query[`${ item_query.field }`] 
                            } 
                        ] 
                    } 
                };
            }
        }
        else if( item_query.field == 'options' ){
            
            new_query[`${ item_query.field }`] = { $elemMatch: { values: { $elemMatch: { handle: new_query[`${ item_query.field }`] } } } };
        }
        else if( item_query.field == 'search_field' && product_discounts != null ){
            search_index_field = index_query;
            new_query[`${ item_query.field }`] = { $regex: `^(?=.*${ item_query.value })${ product_discounts.length == 0 ? '(?!.*private-label)' : '' }.*` , $options: 'i' };
        }
        return new_query;
    });
    if( search_index_field < 0 && product_discounts != null ){
        
        format_query.push({ search_field: { $regex: `^(?!.*private-label).*` , $options: 'i' } });
    }
    format_query            = h_array.sortByProperty(format_query, 0);
    
    if( ( count_fields.repeat_fields == true && disjunctive_query == false ) || ( count_fields.repeat_fields == false && disjunctive_query == false ) ){
        
        format_query.push({ marketplace: id_marketplace });
        format_query.push({ status_created: 'active' });
        format_query.push({ status: 'active' });
    }
    if( count_fields.repeat_fields == true && disjunctive_query == false ){
        
        format_query = { $and: h_array.sortByProperty(format_query, 0) };
    }
    else if( ( count_fields.repeat_fields == true && disjunctive_query == true ) || ( count_fields.repeat_fields == false && disjunctive_query == true ) ){
        
        format_query = { $and: [{ marketplace: id_marketplace }, { status_created: 'active' }, { status: 'active' }, { $or: h_array.sortByProperty(format_query, 0) }] };
    }
    else if( count_fields.repeat_fields == false && disjunctive_query == false ){
        
        format_query = h_array.sortByProperty(format_query, 0).reduce( (previous_item, current_item) => {
            
            previous_item[Object.keys(current_item)[0]] = current_item[Object.keys(current_item)[0]];
            return previous_item;
        }, {});
    }
    return format_query;
};
/**
*
* @param {String} text
* @returns
*/
function slug( text ){
    
    return h_validation.evalString( text ) ? slugify( removeDiacritics( h_validation.evalString( text ) ), { replacement: '-', lower: true, strict: true } ).split('-').filter( (item) => item != '' ).join('-') : null;
};
/**
* 
* @param {*} field 
* @param {*} body_data 
* @param {*} compare_type 
* @param {*} compare_operator 
* @param {*} compare_value 
* @returns 
*/
function objectValidField( field, body_data, compare_type, compare_operator, compare_value ){
    
    return {
        field   : field,
        value   : body_data,
        compare : {
            type    : compare_type,
            operator: compare_operator,
            value   : compare_value
        }
    };
};
/**
* 
* @param {Date} this_date 
* @param {Boolean} init_month 
* @returns 
*/
function dbDate( this_date, init_month = null ){
    
    if( init_month != null && init_month ){
        
        this_date = this_date.utc().startOf('month').startOf('day');
    }
    else if( init_month != null && !init_month ){
        
        this_date = this_date.utc().endOf('month').endOf('day');
    }
    else{
        
        this_date = this_date.utc();
    }
    
    return this_date;
};
/**
* 
* @param {*} amount 
* @param {*} decimalPlaces 
* @returns 
*/
function bankerRounding(amount, decimalPlaces) {
    
    let decimal_places 			= decimalPlaces || 0;
    let potencia 				= Math.pow(10, decimal_places);
    let avoid_rounding_error 	= +(decimal_places ? amount * potencia : amount).toFixed(8); // Avoid rounding errors
    let int_rounding_error 		= Math.floor(avoid_rounding_error); 
    let decimal_rounding_error 	= avoid_rounding_error - int_rounding_error;
    let allow_rounding_error 	= parseFloat('1e-8'); // Allow for rounding errors in decimal_rounding_error
    
    let rounding_number 		= (decimal_rounding_error > 0.5 - allow_rounding_error && decimal_rounding_error < 0.5 + allow_rounding_error) ? ((int_rounding_error % 2 == 0) ? int_rounding_error : int_rounding_error + 1) : Math.round(avoid_rounding_error);
    
    return decimal_places ? rounding_number / potencia : rounding_number;
};
/**
* 
* @param {*} amount 
* @param {*} apply_rounding 
* @param {*} locale 
* @param {*} currency 
* @returns 
*/
function currencyObject( amount, apply_rounding = null, locale = 'en-US', currency = 'USD' ) {
    
    if( !amount || amount == null || isNaN( parseFloat( amount ) ) || typeof amount == 'string' ){
        
        return { format: '$0.00', number: 0 };
    }
    else{
        
        const formatterCurrency = new Intl.NumberFormat( locale, { style: 'currency', currency: currency, minimumFractionDigits: 2 } );
        const parts_format      = formatterCurrency.formatToParts( 1000 );
        
        let regexp_symbol               = new RegExp(`([${ parts_format[0].value }])`, 'g');
        let regexp_separador_millares   = new RegExp(`([${ parts_format[2].value }])`, 'g');
        let regexp_separador_decimal    = new RegExp(`([${ parts_format[parts_format.length - 2].value }])`, 'g');
        
        if( apply_rounding != null ){
            
            amount = ( apply_rounding ? bankerRounding(amount, 2) : amount / 100 );
        }
        let format = formatterCurrency.format( amount );
        
        let number = parseFloat( format.replace( regexp_symbol, '').replace( regexp_separador_millares, '' ).replace( regexp_separador_decimal, '.' ) );
        
        return { format, number };
    }
};
/**
* 
* @param {*} min 
* @param {*} max 
* @returns 
*/
function randomNumber(min, max){
    
    if (Number.isInteger(min) && Number.isInteger(max)) {
        
        return Math.round(Math.random() * (max - min + 1)) + min;
    }
};
// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
    findQuery,
    findQueryProducts,
    slug,
    objectValidField,
    dbDate,
    phoneNumber,
    numberString,
    currencyObject,
    calcDiscountPrice,
    randomNumber,
    fields: {
        types: {
            boolean	: {
                name		: 'boolean',
                operators	: {
                    equal		: 'equal',
                    not_equal	: 'not_equal'
                }
            },
            number	: {
                name		: 'number',
                operators	: {
                    equal					: 'equal',
                    not_equal				: 'not_equal',
                    greater_than			: 'greater_than',
                    less_than				: 'less_than',
                    greater_than_or_equal	: 'greater_than_or_equal',
                    less_than_or_equal		: 'less_than_or_equal'
                }
            },
            string	: {
                name		: 'string',
                operators	: {
                    equal		: 'equal',
                    not_equal	: 'not_equal',
                    contains	: 'contains',
                    not_contains: 'not_contains',
                    starts_with	: 'starts_with',
                    ends_with	: 'ends_with'
                }
            },
            array	: {
                name		: 'array',
                operators	: {
                    contains					: 'contains',
                    not_contains				: 'not_contains',
                    empty						: 'empty',
                    not_empty					: 'not_empty',
                    length_greater_than			: 'length_greater_than',
                    length_greater_than_or_equal: 'length_greater_than_or_equal',
                    length_less_than			: 'length_less_than',
                    length_less_than_or_equal	: 'length_less_than_or_equal',
                    length_equal				: 'length_equal',
                    length_not_equal			: 'length_not_equal'
                }
            },
            object	: {
                name		: 'object',
                operators	: {
                    not_equal	: 'not_equal',
                    contains	: 'contains',
                    not_contains: 'not_contains',
                    all_keys	: 'all_keys',
                    any_keys	: 'any_keys',
                }
            },
            date	: {
                name		: 'date',
                operators	: {
                    equal					: 'equal',
                    not_equal				: 'not_equal',
                    greater_than			: 'greater_than',
                    less_than				: 'less_than',
                    greater_than_or_equal	: 'greater_than_or_equal',
                    less_than_or_equal		: 'less_than_or_equal',
                    between					: 'between',
                }
            }
        }
    }
}