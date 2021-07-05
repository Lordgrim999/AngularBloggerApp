const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/user');
userRouter.post('/signup', UserController.createUser);

userRouter.post('/login', UserController.userLogin);

module.exports = userRouter;
