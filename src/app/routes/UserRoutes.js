import UserController from '../controllers/UserController';
import authMiddleware from '../middlewares/auth';

const express = require('express');

const router = express.Router();

router.post('/users', UserController.create);

router.get('/users', authMiddleware, UserController.index);

router.put('/users', authMiddleware, UserController.update);

router.delete('/users', authMiddleware, UserController.delete);

module.exports = router;
