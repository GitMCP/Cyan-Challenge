"use strict";"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _FarmController = require('../controllers/FarmController'); var _FarmController2 = _interopRequireDefault(_FarmController);
var _auth = require('../middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);

const express = require('express');

const router = express.Router();

router.post('/farms/:harvest_id', _auth2.default, _FarmController2.default.create);

router.get('/farms/:harvest_id?', _auth2.default, _FarmController2.default.index);

router.put('/farms/:farm_id', _auth2.default, _FarmController2.default.update);

router.delete('/farms/:farm_id', _auth2.default, _FarmController2.default.delete);

module.exports = router;
