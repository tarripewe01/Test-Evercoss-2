const express = require('express');
const { getUsers, Register, Login, Logout, DeleteById } = require('../controllers/UsersController');
const verifyToken = require('../middleware/VerifyToken');
const refreshToken = require('../controllers/RefreshToken');

const router = express.Router()

router.post('/users', Register)
router.post('/login', Login)
router.get('/token', refreshToken)
router.delete('/logout', Logout)

router.get('/users', verifyToken, getUsers)
router.delete('/users/:id', verifyToken, DeleteById)

module.exports = router