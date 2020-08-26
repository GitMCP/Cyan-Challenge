import SessionController from '../controllers/SessionController';

const express = require('express');

const router = express.Router();

router.post('/login', SessionController.create);

module.exports = router;
