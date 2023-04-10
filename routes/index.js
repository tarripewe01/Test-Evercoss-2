const express = require('express');
const { getUsers, Register, Login } = require('../controllers/UsersController');
const verifyToken = require('../middleware/VerifyToken');

const router = express.Router()

router.post('/users', Register)
router.post('/login', Login)

router.get('/users', verifyToken, getUsers)

module.exports = router