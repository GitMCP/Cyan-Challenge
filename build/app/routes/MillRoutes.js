"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _MillController = require('../controllers/MillController'); var _MillController2 = _interopRequireDefault(_MillController);
var _auth = require('../middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);

const express = require('express');

const router = express.Router();

router.post('/mills', _auth2.default, _MillController2.default.create);

router.get('/mills', _auth2.default, _MillController2.default.index);

router.put('/mills/:mill_id', _auth2.default, _MillController2.default.update);

router.delete('/mills/:mill_id', _auth2.default, _MillController2.default.delete);

module.exports = router;
