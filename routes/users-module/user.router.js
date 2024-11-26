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

app.post('/create', userController.post.create);

app.put('/update-password', auth.isAuthStore, userController.put.updatePassword);

app.put('/update-status', auth.isAuthAdmin, userController.put.updateStatus);

app.post('/find-agent', auth.isAuthStore, userController.post.findAgentCustomerLead);

module.exports = app;