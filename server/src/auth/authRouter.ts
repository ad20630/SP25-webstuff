const express = require('express');
const { registerUser, loginUser, getUserDetails } = require('./authController');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUserDetails);

module.exports = { authRouter: router }; 
