"use strict";"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

class Harvest extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        code: _sequelize2.default.STRING,
        start_date: _sequelize2.default.DATE,
        end_date: _sequelize2.default.DATE,
        deleted_at: _sequelize2.default.DATE
      },
      {
        sequelize
      }
    );
  }
  static associate(model) {
    this.belongsTo(model.User, { foreignKey: 'author_id', as: 'author' });
    this.belongsTo(model.Mill, { foreignKey: 'mill_id', as: 'ownerMill' });
  }
}

exports. default = Harvest;
