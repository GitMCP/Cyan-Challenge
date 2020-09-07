import DataTypes, { Model } from 'sequelize';

class Harvest extends Model {
  static init(sequelize) {
    super.init(
      {
        code: DataTypes.STRING,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        deleted_at: DataTypes.DATE
      },
      {
        sequelize,
        paranoid: true,
        deletedAt: 'deleted_at'
      }
    );
  }
  static associate(model) {
    this.belongsTo(model.User, { foreignKey: 'author_id', as: 'author' });
    this.belongsTo(model.Mill, { foreignKey: 'mill_id', as: 'ownerMill' });
  }
}

export default Harvest;
