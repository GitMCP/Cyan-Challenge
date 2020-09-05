"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _FieldController = require('../controllers/FieldController'); var _FieldController2 = _interopRequireDefault(_FieldController);
var _auth = require('../middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);

const express = require('express');

const router = express.Router();

router.post('/fields/:farm_id', _auth2.default, _FieldController2.default.create);

router.get('/fields/:farm_id?', _auth2.default, _FieldController2.default.index);

router.put('/fields/:field_id', _auth2.default, _FieldController2.default.update);

router.delete('/fields/:field_id', _auth2.default, _FieldController2.default.delete);

module.exports = router;
