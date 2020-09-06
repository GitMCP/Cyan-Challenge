"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class Field extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        code: _sequelize2.default.STRING,
        location: _sequelize2.default.GEOMETRY,
        deleted_at: _sequelize2.default.DATE
      },
      {
        sequelize
      }
    );
  }
  static associate(model) {
    this.belongsTo(model.User, { foreignKey: 'author_id', as: 'author' });
    this.belongsTo(model.Farm, {
      foreignKey: 'farm_id',
      as: 'ownerFarm'
    });
  }
}

exports. default = Field;
