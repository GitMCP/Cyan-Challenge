"use strict";"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _UserController = require('../controllers/UserController'); var _UserController2 = _interopRequireDefault(_UserController);
var _auth = require('../middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);

const express = require('express');

const router = express.Router();

router.post('/users', _UserController2.default.create);

router.get('/users', _auth2.default, _UserController2.default.index);

router.put('/users', _auth2.default, _UserController2.default.update);

router.delete('/users', _auth2.default, _UserController2.default.delete);

module.exports = router;
