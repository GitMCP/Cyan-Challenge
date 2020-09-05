"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _SessionController = require('../controllers/SessionController'); var _SessionController2 = _interopRequireDefault(_SessionController);

const express = require('express');

const router = express.Router();

router.post('/login', _SessionController2.default.create);

module.exports = router;
