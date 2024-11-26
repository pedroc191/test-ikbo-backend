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
	inventoryTransactionController
} = require('../../controllers/main/manager');
// =============================================================================
// ROUTES
// =============================================================================

app.post('/find', inventoryTransactionController.post.findDocument);

app.post('/list', inventoryTransactionController.post.listDocuments);

app.post('/create', inventoryTransactionController.post.createDocument);

app.put('/update', inventoryTransactionController.put.updateDocument);

app.put('/update-status', inventoryTransactionController.put.updateDocumentStatus);

app.delete('/delete', inventoryTransactionController.delete.deleteDocument);

module.exports = app;