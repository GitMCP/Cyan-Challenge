import FarmController from '../controllers/FarmController';
import authMiddleware from '../middlewares/auth';

const express = require('express');

const router = express.Router();

router.post('/farms/filter', authMiddleware, FarmController.index);

router.post('/farms/:harvest_id', authMiddleware, FarmController.create);

router.put('/farms/:farm_id', authMiddleware, FarmController.update);

router.delete('/farms/:farm_id', authMiddleware, FarmController.delete);

module.exports = router;
