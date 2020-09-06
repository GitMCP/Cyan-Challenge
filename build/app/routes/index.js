"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _SessionRoutes = require('./SessionRoutes'); var _SessionRoutes2 = _interopRequireDefault(_SessionRoutes);
var _UserRoutes = require('./UserRoutes'); var _UserRoutes2 = _interopRequireDefault(_UserRoutes);
var _MillRoutes = require('./MillRoutes'); var _MillRoutes2 = _interopRequireDefault(_MillRoutes);
var _HarvestRoutes = require('./HarvestRoutes'); var _HarvestRoutes2 = _interopRequireDefault(_HarvestRoutes);
var _FarmRoutes = require('./FarmRoutes'); var _FarmRoutes2 = _interopRequireDefault(_FarmRoutes);
var _FieldRoutes = require('./FieldRoutes'); var _FieldRoutes2 = _interopRequireDefault(_FieldRoutes);

const routes = {
  FieldRoutes: _FieldRoutes2.default,
  FarmRoutes: _FarmRoutes2.default,
  HarvestRoutes: _HarvestRoutes2.default,
  MillRoutes: _MillRoutes2.default,
  SessionRoutes: _SessionRoutes2.default,
  UserRoutes: _UserRoutes2.default
};

exports. default = routes;
