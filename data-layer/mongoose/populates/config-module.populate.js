let back_application_populate   = [ 
	{ path: 'role', match: { status: 'active', deleted: false }, populate: [
        { path: 'endpoints', match: { status: 'active', deleted: false } },
    ] }
];
let back_role_populate          = [ 
	{ path: 'endpoints', match: { status: 'active', deleted: false } }
];
let back_endpoint_populate      = null;

module.exports = {
    back_application_populate,
    back_role_populate,
    back_endpoint_populate
};