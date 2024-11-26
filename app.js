// =============================================================================
// PACKAGES
// =============================================================================
const createError 	= require('http-errors');
const express 		= require('express');
const path 			= require('path');
const cookieParser	= require('cookie-parser');
const logger 		= require('morgan');
const dotenv 		= require('dotenv');
const compression   = require('compression');
const session 		= require('express-session');
const mongoStore	= require('connect-mongo');
const cors 			= require('cors');
// =============================================================================
// EXECUTE .ENV
// =============================================================================
dotenv.config({ path: './.env' });
// =============================================================================
// CREDENTIALS
// =============================================================================
const credentials = require('./config/credentials');
// =============================================================================
// CONFIG DATABASE
// =============================================================================
const config_db	= require('./config/data-base');
const mongooseDb = config_db.mongoose.instanceDB();

mongooseDb.on('error', function(error) { 
	
	console.error('Error in MongoDb connection: ' + error);
	config_db.mongoose.disconnectDB(); 
});
mongooseDb.on('disconnected', function() {
	
	config_db.mongoose.connectionDB( process.env.NODE_ENV == 'developer' ? credentials.data_base.mongodb.developer : credentials.data_base.mongodb.production );
});

config_db.mongoose.connectionDB( process.env.NODE_ENV == 'developer' ? credentials.data_base.mongodb.developer : credentials.data_base.mongodb.production );
// =============================================================================
// SERVICES
// =============================================================================
const {
    backGeneralSettingService,
} = require('./services/manager');
// =============================================================================
// GLOBAL VARIABLES
// =============================================================================
global.image_file_types 	= ['jpg', 'jpeg', 'png', 'ico', 'svg', 'webp'];
global.docs_file_types 		= ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];
process.env.APP_VERSION 	= "1.0.0";
// =============================================================================
// 256 - Nada es verdad todo esta permitido. Ezio Auditore da Firenze (1459 – 1524)
// =============================================================================
// =============================================================================
// ROUTERS
// =============================================================================
const router_manager = require('./routes/main/manager');
// =============================================================================
// VIEW ENGINE SETUP
// =============================================================================

const app = express();
if( process.env.NODE_ENV === 'developer' ) {

	app.use(cors());
}

function shouldCompress (req, res) {
	if (req.headers['x-no-compression']) {
		// don't compress responses with this request header
		return false
	}
	// fallback to standard filter function
	return compression.filter(req, res)
}
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use( compression( { filter: shouldCompress } ) );
app.use( session({
	secret: credentials.encrypted.key_session,
	resave: true,
	saveUninitialized: true,
	store: mongoStore.create({ mongoUrl: process.env.NODE_ENV != 'developer' ? credentials.data_base.mongodb.developer : credentials.data_base.mongodb.production }),
}));
app.use( logger( ':date[web] :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', { 
	skip: function (req, res) { 
		return ( [304, 200].includes( res.statusCode ) ) || ( res.statusCode == 404 && global.image_file_types.concat( global.docs_file_types ).findIndex( (item) => req.url.indexOf( item ) >= 0 ) >= 0 )
	} 
} ) );
app.use( express.json( { limit: '50mb' } ) );
app.use( express.urlencoded( { extended: true, limit: '50mb', parameterLimit: 1000000 } ) );
app.use( cookieParser() );
app.use( express.static( path.join(__dirname, 'public') ) );
// =============================================================================
// BASE ROUTES
// =============================================================================
app.use('/api'	, router_manager);
// =============================================================================
// CATCH 404 AND FORWARD TO ERROR HANDLER
// =============================================================================
app.use(function(req, res, next) {
	
	next(createError(404));
});
// =============================================================================
// ERROR HANDLER
// =============================================================================
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'developer' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.locals.error.status = res.locals.message == 'Not Found' ? 404 : res.locals.error.status;
	
	res.json({
		title		: `Error ${ res.locals.error.status }: ${ res.locals.message }`,
		status		: res.locals.error.status,
		message		: res.locals.message ? res.locals.message.toString().replace(/\\/g, '/') : '',
		description	: res.locals.error.stack ? res.locals.error.stack.replace(/\\/g, '/').replace(/(')/g, '').replace(/(')/g, '') : '',
	});
});

module.exports = app;
