module.exports = {
    data_base   : {
        mongodb: {
            developer   : process.env.MONGODB_DEV,
            production  : process.env.MONGODB_PROD
        }
    },
    encrypted   : {
        key_session : process.env.KEY_SESSION,
        key_decrypt : process.env.KEY_DECRYPT,
        key_test    : process.env.KEY_TEST,
        key_cms     : process.env.KEY_CMS
    }                 
};