// =============================================================================
// PACKAGES
// =============================================================================
const express 		= require('express');
const app 			= express.Router();
// =============================================================================
// MIDDLEWARES
// =============================================================================
const auth 			= require('../../middlewares/authentication');
// =============================================================================
// CONTROLLERS
// =============================================================================
const { 
	userController
} = require('../../controllers/main/manager');
// =============================================================================
// ROUTES
// =============================================================================
app.post('/login', userController.post.login);

app.post('/create', userController.post.createDocument);

app.put('/update-password', userController.put.updatePassword);

app.put('/update-status', userController.put.updateDocumentStatus);

module.exports = app;