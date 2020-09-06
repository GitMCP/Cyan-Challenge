"use strict";"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _util = require('util');
var _User = require('../models//User'); var _User2 = _interopRequireDefault(_User);

var _auth = require('../../config/auth'); var _auth2 = _interopRequireDefault(_auth);

exports. default = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // eslint-disable-next-line eqeqeq
  if (!authHeader || authHeader == 'Bearer ') {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await _util.promisify.call(void 0, _jsonwebtoken2.default.verify)(token, _auth2.default.secret);
    req.userId = decoded.id;
    if ((await _User2.default.findOne({ where: { id: decoded.id } })).deleted_at) {
      return res.status(401).json({ error: "User  doesn't  exists!" });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
};
