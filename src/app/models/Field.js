import DataTypes, { Model } from 'sequelize';

class Field extends Model {
	static init(sequelize) {
		super.init(
			{
				code: DataTypes.STRING,
				location: DataTypes.GEOMETRY,
				deleted_at: DataTypes.DATE
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

export default Field;
