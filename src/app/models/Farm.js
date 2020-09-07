import DataTypes, { Model } from 'sequelize';

class Farm extends Model {
  static init(sequelize) {
    super.init(
      {
        code: DataTypes.STRING,
        name: DataTypes.STRING,
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
    this.belongsTo(model.Harvest, {
      foreignKey: 'harvest_id',
      as: 'ownerHarvest'
    });
  }
}

export default Farm;
