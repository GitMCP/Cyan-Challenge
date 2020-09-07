import FieldController from '../controllers/FieldController';
import authMiddleware from '../middlewares/auth';

const express = require('express');

const router = express.Router();

router.post('/fields/filter', authMiddleware, FieldController.index);

router.post('/fields/:farm_id', authMiddleware, FieldController.create);

router.put('/fields/:field_id', authMiddleware, FieldController.update);

router.delete('/fields/:field_id', authMiddleware, FieldController.delete);

module.exports = router;
