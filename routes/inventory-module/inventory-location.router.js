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
	inventoryLocationController
} = require('../../controllers/main/manager');
// =============================================================================
// ROUTES
// =============================================================================

app.post('/find', inventoryLocationController.post.findDocument);

app.post('/list', inventoryLocationController.post.listDocuments);

app.post('/create', inventoryLocationController.post.createDocument);

app.put('/update', inventoryLocationController.put.updateDocument);

app.put('/update-status', inventoryLocationController.put.updateDocumentStatus);

app.delete('/delete', inventoryLocationController.delete.deleteDocument);

module.exports = app;