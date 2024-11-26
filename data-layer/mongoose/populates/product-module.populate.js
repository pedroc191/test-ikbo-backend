let back_product_populate           = [
    { path: 'variants', populate: [
        { path: 'inventory_variants', populate: [
            { path: 'location', match: { status: 'active', deleted: false } }
        ], match: { status: 'active', deleted: false }}
    ], match: { status: 'active', deleted: false } }
];
let back_product_variant_populate   = [
    { path: 'inventory_variants', populate: [
        { path: 'location', match: { status: 'active', deleted: false } }
    ], match: { status: 'active', deleted: false }}
];

module.exports = {
    back_product_populate,
    back_product_variant_populate
};