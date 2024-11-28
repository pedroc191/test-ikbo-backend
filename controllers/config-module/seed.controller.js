// =============================================================================
// HELPERS
// =============================================================================
// =============================================================================
// SERVICES
// =============================================================================
const { 
    backRoleService,
    backUserService,
    backInventoryLocationService
} = require('../../services/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

async function seedInit(req, res){
    
    let locations = [
        {
            "name"        : "Almacen A",
            "handle"      : "almacen-a",
            "first_name"  : "Pedro G.",
            "last_name"   : "Camacaro A.",
            "phone"       : "+11234567891",
            "address_1"   : "Calle 21 Sur # 41 B - 55",
            "address_2"   : "Urbanizacion QuebradaHonda, Casa 101 Bloque 5",
            "country"     : "Colombia",
            "country_code": "COP",
            "state"       : "Antiopquia",
            "state_code"  : "ANQ",
            "city"        : "Envigado",
            "zip"         : "457665"
        },
        {
            "name"        : "Almacen B",
            "handle"      : "almacen-b",
            "first_name"  : "Pedro G.",
            "last_name"   : "Camacaro A.",
            "phone"       : "+11234567891",
            "address_1"   : "Calle 21 Sur # 41 B - 55",
            "address_2"   : "Urbanizacion QuebradaHonda, Casa 101 Bloque 5",
            "country"     : "Colombia",
            "country_code": "COP",
            "state"       : "Antiopquia",
            "state_code"  : "ANQ",
            "city"        : "Envigado",
            "zip"         : "457665"
        },
        {
            "name"        : "Almacen C",
            "handle"      : "almacen-c",
            "first_name"  : "Pedro G.",
            "last_name"   : "Camacaro A.",
            "phone"       : "+11234567891",
            "address_1"   : "Calle 21 Sur # 41 B - 55",
            "address_2"   : "Urbanizacion QuebradaHonda, Casa 101 Bloque 5",
            "country"     : "Colombia",
            "country_code": "COP",
            "state"       : "Antiopquia",
            "state_code"  : "ANQ",
            "city"        : "Envigado",
            "zip"         : "457665"
        }
    ];
    for (const item_location of locations) {
        
        await backInventoryLocationService.create( item_location );
    }
    let role = {
        "name"        : "Administrador",
        "handle"      : "admin",
        "endpoints"   : [],
        "test_mode"   : true
    };
    let role_created = await backRoleService.create( role );
    if( role_created.success ){

        let user = {
            "role"        : role_created.data._id.toString(),
            "first_name"  : "Pedro G.",
            "last_name"   : "Camacaro A.",
            "email"       : "test@gmail.com",
            "password"    : "123456789",
        }
        await backUserService.create( user );
    }
    res.json("CHARGED DATA");
};
// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
    get:{
        seedInit
    }
};