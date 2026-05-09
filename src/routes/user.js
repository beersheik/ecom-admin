const express = require('express');
const userController = require('../controllers/userController');
const { verifyAdminToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public — auth endpoints
router.post('/login', userController.userLogin);
router.post('/logout', userController.userLogout);

// Admin protected
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', verifyAdminToken, requireAdmin, userController.deleteUser);

module.exports = router;
