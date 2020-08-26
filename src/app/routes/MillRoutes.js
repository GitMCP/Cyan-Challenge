import MillController from '../controllers/MillController';
import authMiddleware from '../middlewares/auth';

const express = require('express');

const router = express.Router();

router.post('/mills', authMiddleware, MillController.create);

router.get('/mills',  authMiddleware, MillController.index);

router.put('/mills/:mill_id', authMiddleware, MillController.update);

router.delete('/mills/:mill_id', authMiddleware, MillController.delete);

module.exports = router;
