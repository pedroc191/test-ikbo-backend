// =============================================================================
// PACKAGES
// =============================================================================
const express 		= require('express');
const app 			= express.Router();
// =============================================================================
// MIDDLEWARES
// =============================================================================
const auth 				= require('../../middlewares/authentication');
// =============================================================================
// CONTROLLERS
// =============================================================================
const { 
	productController
} = require('../../controllers/main/manager');
// =============================================================================
// ROUTES
// =============================================================================

app.post('/find', productController.post.findDocument);

app.post('/list', productController.post.listDocuments);

app.post('/create', productController.post.createDocument);

app.put('/update', productController.put.updateDocument);

app.put('/update-status', productController.put.updateDocumentStatus);

app.delete('/delete', productController.delete.deleteDocument);

module.exports = app;