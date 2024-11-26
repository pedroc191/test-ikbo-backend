let back_user_populate = [ 
	{ path: 'role', match: { status: 'active', deleted: false }, populate: [
        { path: 'endpoints', match: { status: 'active', deleted: false } },
    ] }
];

module.exports = {
    back_user_populate
};