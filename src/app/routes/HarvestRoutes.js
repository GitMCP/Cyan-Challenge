import HarvestController from '../controllers/HarvestController';
import authMiddleware from '../middlewares/auth';

const express = require('express');

const router = express.Router();

router.post('/harvests/:mill_id', authMiddleware, HarvestController.create);

router.get('/harvests/:mill_id?',  authMiddleware, HarvestController.index);

router.put('/harvests/:harvest_id', authMiddleware, HarvestController.update);

router.delete('/harvests/:harvest_id', authMiddleware, HarvestController.delete);

module.exports = router;