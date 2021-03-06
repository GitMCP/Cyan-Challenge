import DataTypes, { Model } from 'sequelize';

class Mill extends Model {
  static init(sequelize) {
    super.init(
      {
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
  }
}

export default Mill;
