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
	inventoryVariantController
} = require('../../controllers/main/manager');
// =============================================================================
// ROUTES
// =============================================================================

app.post('/find', inventoryVariantController.post.findDocument);

app.post('/list', inventoryVariantController.post.listDocuments);

app.post('/create', inventoryVariantController.post.createDocument);

app.put('/update', inventoryVariantController.put.updateDocument);

app.put('/update-status', inventoryVariantController.put.updateDocumentStatus);

app.delete('/delete', inventoryVariantController.delete.deleteDocument);

module.exports = app;