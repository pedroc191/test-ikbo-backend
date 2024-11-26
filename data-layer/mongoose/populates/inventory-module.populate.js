
let back_inventory_location_populate    = null;
let back_inventory_variant_populate     = [
    { path: 'location', select: 'name handle', match: { status: 'active', deleted: false } },
    { path: 'variant', select: 'sku grams weight weight_unit', match: { status: 'active', deleted: false } },
];
let back_inventory_transaction_populate = [
    { path: 'inventory_item', populate: [
        { path: 'location', select: 'name handle', match: { status: 'active', deleted: false } },
        { path: 'variant', select: 'sku grams weight weight_unit', match: { status: 'active', deleted: false } },
    ], match: { status: 'active', deleted: false } }
];

module.exports = {
    back_inventory_location_populate,
    back_inventory_variant_populate,
    back_inventory_transaction_populate
};