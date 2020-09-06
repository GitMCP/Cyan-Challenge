"use strict";"use strict";"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _HarvestController = require('../controllers/HarvestController'); var _HarvestController2 = _interopRequireDefault(_HarvestController);
var _auth = require('../middlewares/auth'); var _auth2 = _interopRequireDefault(_auth);

const express = require('express');

const router = express.Router();

router.post('/harvests/:mill_id', _auth2.default, _HarvestController2.default.create);

router.get('/harvests/:mill_id?', _auth2.default, _HarvestController2.default.index);

router.put('/harvests/:harvest_id', _auth2.default, _HarvestController2.default.update);

router.delete(
  '/harvests/:harvest_id',
  _auth2.default,
  _HarvestController2.default.delete
);

module.exports = router;
