// =============================================================================
// PACKAGES
// =============================================================================
const mongoose = require('mongoose');
// =============================================================================
// FUNCTIONS
// =============================================================================
module.exports = {
    mongoose: {
        instanceDB(){
            return mongoose.connection;
        },
        /**
        * DESCRIPTION: MongoDB Connection Settings
        * @param {String} url_DB MongoDB Url mongodb://{ user }:{ password }@{ host }:{ port }/{ database }
        */
        connectionDB: function( url_DB ){
            
            mongoose.set('strictQuery', false);
            mongoose.connect( url_DB, {
                keepAlive: true,
                socketTimeoutMS: 1800000,
                serverSelectionTimeoutMS: 1800000,
                connectTimeoutMS: 1800000,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoIndex: true
            });
        },
        /**
        * DESCRIPTION: Create MongoDB Connection Settings
        * @param {String} url_DB MongoDB Url. Example: mongodb://{ user }:{ password }@{ host }:{ port }/{ database }
        */
        createNewConnectionDB: function( url_DB ){
            
            mongoose.createConnection( url_DB, {
                keepAlive: true,
                socketTimeoutMS: 1800000,
                serverSelectionTimeoutMS: 1800000,
                connectTimeoutMS: 1800000,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoIndex: true
            });
        },
        disconnectDB(){
            mongoose.disconnect();
        }
    }
};
