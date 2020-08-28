import FarmController from '../controllers/FarmController';
import authMiddleware from '../middlewares/auth';

const express = require('express');

const router = express.Router();

router.post('/farms/:harvest_id', authMiddleware, FarmController.create);

router.get('/farms/:harvest_id?', authMiddleware, FarmController.index);

router.put('/farms/:farm_id', authMiddleware, FarmController.update);

router.delete('/farms/:farm_id', authMiddleware, FarmController.delete);

module.exports = router;
