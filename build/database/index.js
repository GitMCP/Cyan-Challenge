"use strict";"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _User = require('../app/models/User'); var _User2 = _interopRequireDefault(_User);
var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);
var _Mill = require('../app/models/Mill'); var _Mill2 = _interopRequireDefault(_Mill);
var _Harvest = require('../app/models/Harvest'); var _Harvest2 = _interopRequireDefault(_Harvest);
var _Farm = require('../app/models/Farm'); var _Farm2 = _interopRequireDefault(_Farm);
var _Field = require('../app/models/Field'); var _Field2 = _interopRequireDefault(_Field);

const models = [_User2.default, _Mill2.default, _Harvest2.default, _Farm2.default, _Field2.default];

const connection = new (0, _sequelize2.default)(_database2.default);

models.map(model => model.init(connection));

_Mill2.default.associate(connection.models);
_Harvest2.default.associate(connection.models);
_Farm2.default.associate(connection.models);
_Field2.default.associate(connection.models);

module.exports = connection;
